/**
 * Silent Payments (BIP-352) — côté émetteur + encodage d'adresse.
 *
 * Implémentation réelle, basée sur des primitives auditées :
 *   - @noble/curves/secp256k1  (secp256k1, ECDH, tweak de clé)
 *   - @noble/hashes/sha2       (SHA-256, hash taggé BIP-340)
 *   - @scure/base              (bech32m, BIP-350)
 *
 * Référence normative : BIP-352 (bitcoin/bips), version 1.1.1.
 * Validé contre les vecteurs de test officiels send_and_receive_test_vectors.json.
 *
 * L'extraction des clés d'input (P2TR/P2WPKH/P2SH-P2WPKH/P2PKH, skip des clés
 * non compressées / NUMS / P2SH invalides) est la responsabilité du wallet
 * appelant — ce module prend des inputs déjà extraits et dérive les sorties.
 *
 * NOTE de production : les clés scan/spend d'un vrai wallet sont dérivées en
 * BIP32 durci (m/352'/coin_type'/account'/1'/0 et …/0'/0). Ici on accepte des
 * clés indépendantes — le format d'adresse et la dérivation émetteur n'en
 * dépendent pas.
 */

import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bech32m } from "@scure/base";

const G = secp256k1.Point.BASE;
const ZERO = secp256k1.Point.ZERO;
const N = secp256k1.Point.Fn.ORDER;

/** BIP-352 : limite d'adresses par groupe de clé de scan (anti-scan quadratique). */
const K_MAX = 2323;

const te = new TextEncoder();

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0) throw new Error("hex de longueur impaire");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}

/** BIP-340 : hash_tag(x) = SHA256(SHA256(tag) || SHA256(tag) || x). */
function taggedHash(tag: string, data: Uint8Array): Uint8Array {
  const tagHash = sha256(te.encode(tag));
  return sha256(concatBytes(tagHash, tagHash, data));
}

/** ser32(i) : entier 32 bits, octet le plus significatif en premier. */
function ser32(i: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, i, false);
  return b;
}

type Point = InstanceType<typeof secp256k1.Point>;

/** serP(P) : forme compressée SEC1 (0x02/0x03 || x). */
function serP(point: Point): Uint8Array {
  return point.toBytes(true);
}

/** x-only (BIP-340) : les 32 octets de x, parité Y implicite (paire). */
function xonly(point: Point): Uint8Array {
  return point.toBytes(true).subarray(1);
}

function pointFromHex(hex: string): Point {
  return secp256k1.Point.fromHex(hex);
}

/** Encodage bech32m style segwit : la version est le premier symbole 5 bits. */
function segwitEncode(hrp: string, version: number, program: Uint8Array, limit: number): string {
  const words = bech32m.toWords(program);
  return bech32m.encode(hrp, [version, ...words], limit);
}

/** Adresse Silent Payment v0 (sp1q…) = bech32m("sp", 0, serP(Bscan) || serP(Bm)). */
export function encodeSilentPaymentAddress(scanPubHex: string, spendPubHex: string): string {
  const scan = hexToBytes(scanPubHex);
  const spend = hexToBytes(spendPubHex);
  if (scan.length !== 33 || spend.length !== 33) {
    throw new Error("clés scan/spend attendues en 33 octets (compressées)");
  }
  return segwitEncode("sp", 0, concatBytes(scan, spend), 1023);
}

/** Adresse de sortie P2TR (bc1p…) = bech32m("bc", 1, x-only). */
export function encodeTaprootAddress(xonlyHex: string): string {
  const x = hexToBytes(xonlyHex);
  if (x.length !== 32) throw new Error("clé x-only attendue en 32 octets");
  return segwitEncode("bc", 1, x, 90);
}

export interface SpInput {
  /** Clé privée (32 octets hex). */
  privKey: string;
  /** Clé publique : 33 octets compressés, ou 32 octets x-only si `taproot`. */
  pubKey: string;
  /** P2TR (x-only) : on relève en Y pair et on négate la privée si nécessaire. */
  taproot?: boolean;
}

export interface SpRecipient {
  /** Clé de scan publique, 33 octets compressés hex (B_scan). */
  scanPub: string;
  /** Clé de dépense publique B_m, 33 octets compressés hex (B_spend, ou labelé). */
  spendPub: string;
  /** Nombre de sorties à générer pour ce destinataire (défaut 1). */
  count?: number;
}

export interface SpOutput {
  /** Indice k dans le groupe (0, 1, 2…). */
  k: number;
  /** Clé x-only de la sortie Taproot (32 octets hex). */
  xonly: string;
  /** Adresse on-chain bc1p correspondante. */
  address: string;
}

export interface SpDerivation {
  inputHash: string;
  /** ecdh_shared_secret, 33 octets compressés hex. */
  sharedSecret: string;
  /** A = somme des clés publiques d'input (33 octets compressés hex). */
  inputSum: string;
  outputs: SpOutput[];
}

/**
 * Dérive les sorties Silent Payment (BIP-352) pour un ou plusieurs destinataires.
 *
 * @param inputs    clés privées/publiques des inputs éligibles (P2TR/P2WPKH/…)
 * @param outpoints outpoints de TOUS les inputs de la transaction (txid affiché
 *                  big-endian + vout) — `outpoint_L` est le plus petit d'entre eux
 * @param recipients destinataires (regroupés par clé de scan)
 */
export function deriveSilentPaymentOutputs(opts: {
  inputs: SpInput[];
  outpoints: { txid: string; vout: number }[];
  recipients: SpRecipient[];
}): SpDerivation {
  const { inputs, outpoints, recipients } = opts;
  if (inputs.length === 0) throw new Error("aucun input pour la dérivation");
  if (outpoints.length === 0) throw new Error("aucun outpoint");

  // 1. Somme des clés privées (négation des clés P2TR à Y impair) et publiques.
  let a = 0n;
  let A: Point = ZERO;
  for (const input of inputs) {
    let priv = BigInt("0x" + input.privKey);
    let pub: Point;
    if (input.taproot) {
      // x-only → relève en Y pair ; si priv·G a Y impair, négation de priv.
      if (G.multiply(priv).y % 2n !== 0n) priv = (N - priv) % N;
      pub = pointFromHex("02" + input.pubKey);
    } else {
      pub = pointFromHex(input.pubKey);
    }
    a = (a + priv) % N;
    A = A.add(pub);
  }
  if (a === 0n) throw new Error("somme des clés privées nulle");

  // 2. input_hash = hash_BIP0352/Inputs(outpoint_L || A).
  const inputHash = taggedHash("BIP0352/Inputs", concatBytes(smallestOutpoint(outpoints), serP(A)));
  const inputHashBn = BigInt("0x" + bytesToHex(inputHash));
  if (inputHashBn === 0n || inputHashBn >= N) throw new Error("input_hash scalaire invalide");

  // 3. Regrouper les destinataires par B_scan ; limite K_max par groupe.
  const groups = new Map<string, Point[]>();
  for (const r of recipients) {
    const spend = pointFromHex(r.spendPub);
    const list = groups.get(r.scanPub) ?? [];
    const count = r.count ?? 1;
    for (let i = 0; i < count; i++) list.push(spend);
    groups.set(r.scanPub, list);
  }
  for (const [, bms] of groups) {
    if (bms.length > K_MAX) throw new Error("limite K_max dépassée");
  }

  // 4. ecdh_shared_secret = input_hash · a · Bscan ; t_k ; P = Bm + t_k·G.
  const outputs: SpOutput[] = [];
  let firstSharedSecret = "";
  for (const [scanHex, bms] of groups) {
    const ecdh = pointFromHex(scanHex).multiply((inputHashBn * a) % N);
    if (!firstSharedSecret) firstSharedSecret = bytesToHex(serP(ecdh));
    let k = 0;
    for (const Bm of bms) {
      const t = taggedHash("BIP0352/SharedSecret", concatBytes(serP(ecdh), ser32(k)));
      const tBn = BigInt("0x" + bytesToHex(t));
      if (tBn === 0n || tBn >= N) throw new Error("t_k scalaire invalide");
      const P = Bm.add(G.multiply(tBn));
      const xh = bytesToHex(xonly(P));
      outputs.push({ k, xonly: xh, address: encodeTaprootAddress(xh) });
      k++;
    }
  }

  return {
    inputHash: bytesToHex(inputHash),
    sharedSecret: firstSharedSecret,
    inputSum: bytesToHex(serP(A)),
    outputs,
  };
}

/** Outpoint le plus petit lexicographiquement : txid LE (32) || vout LE (4). */
function smallestOutpoint(outpoints: { txid: string; vout: number }[]): Uint8Array {
  const ser = (o: { txid: string; vout: number }): Uint8Array => {
    const txidLE = hexToBytes(o.txid).slice().reverse();
    const voutLE = new Uint8Array(4);
    new DataView(voutLE.buffer).setUint32(0, o.vout, true);
    return concatBytes(txidLE, voutLE);
  };
  let best = ser(outpoints[0]);
  for (let i = 1; i < outpoints.length; i++) {
    const cur = ser(outpoints[i]);
    if (compareBytes(cur, best) < 0) best = cur;
  }
  return best;
}

function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

export interface RecipientKeys {
  scanPriv: string;
  spendPriv: string;
  scanPub: string;
  spendPub: string;
  address: string;
}

/** Génère un jeu de clés scan/spend (démo) + l'adresse sp1q associée. */
export function generateRecipientKeys(scanPrivHex?: string, spendPrivHex?: string): RecipientKeys {
  const scanPriv = scanPrivHex ?? bytesToHex(secp256k1.utils.randomSecretKey());
  const spendPriv = spendPrivHex ?? bytesToHex(secp256k1.utils.randomSecretKey());
  const scanPub = bytesToHex(G.multiply(BigInt("0x" + scanPriv)).toBytes(true));
  const spendPub = bytesToHex(G.multiply(BigInt("0x" + spendPriv)).toBytes(true));
  return {
    scanPriv,
    spendPriv,
    scanPub,
    spendPub,
    address: encodeSilentPaymentAddress(scanPub, spendPub),
  };
}

/** Génère une clé d'input émetteur (démo) : privée 32 octets + publique compressée. */
export function generateInputKey(): { privKey: string; pubKey: string } {
  const priv = bytesToHex(secp256k1.utils.randomSecretKey());
  const pub = bytesToHex(G.multiply(BigInt("0x" + priv)).toBytes(true));
  return { privKey: priv, pubKey: pub };
}
