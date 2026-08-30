import { RECIPIENT } from "./identity";

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

export type Rail = "lightning" | "silent";

export type Receipt = {
  id: string;
  rail: Rail;
  amountSats: number;
  at: number;
  paymentHash?: string;
  preimage?: string;
  invoice?: string;
  taprootOutput?: string;
  sharedSecret?: string;
  inputHash?: string;
  k: number;
};

export async function sha256(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

export function toHex(bytes: Uint8Array, len?: number) {
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return len ? hex.slice(0, len) : hex;
}

function to5bit(bytes: Uint8Array): number[] {
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) out.push((acc << (5 - bits)) & 31);
  return out;
}

export function encodeBech32(hrp: string, version: string, bytes: Uint8Array, dataLen: number) {
  const chars = to5bit(bytes).map((v) => CHARSET[v]!);
  while (chars.length < dataLen) {
    chars.push(CHARSET[chars.length % 32]!);
  }
  return `${hrp}1${version}${chars.slice(0, dataLen).join("")}`;
}

async function digestTwice(seed: string) {
  const a = await sha256(seed);
  const b = await sha256(toHex(a) + seed);
  const out = new Uint8Array(64);
  out.set(a, 0);
  out.set(b, 32);
  return out;
}

export async function deriveSilentPayment(opts: {
  amountSats: number;
  nonce: string;
  k: number;
}): Promise<Pick<Receipt, "taprootOutput" | "sharedSecret" | "inputHash" | "k" | "id">> {
  const seed = [
    "bip352",
    opts.nonce,
    String(opts.k),
    String(opts.amountSats),
    RECIPIENT.scanPub,
    RECIPIENT.spendPub,
  ].join("|");
  const bytes = await digestTwice(seed);
  const inputHash = toHex(bytes.subarray(0, 16));
  const shared = toHex(bytes.subarray(16, 48));
  const taprootOutput = encodeBech32("bc", "p", bytes.subarray(32, 64), 58);
  return {
    id: toHex(bytes.subarray(0, 8)),
    taprootOutput,
    sharedSecret: `ss_${shared.slice(0, 24)}`,
    inputHash,
    k: opts.k,
  };
}

export async function deriveLightningInvoice(opts: {
  amountSats: number;
  nonce: string;
  k: number;
}): Promise<Pick<Receipt, "paymentHash" | "preimage" | "invoice" | "k" | "id">> {
  const seed = ["bolt12", opts.nonce, String(opts.k), String(opts.amountSats), RECIPIENT.lno].join(
    "|",
  );
  const bytes = await digestTwice(seed);
  const preimage = toHex(bytes.subarray(0, 32));
  const paymentHash = toHex(bytes.subarray(32, 64));
  const invoice = encodeBech32("lnbc", "", bytes.subarray(8, 40), 72).replace("lnbc1", "lnbc");
  return {
    id: toHex(bytes.subarray(0, 8)),
    paymentHash,
    preimage,
    invoice: `${invoice}1p${CHARSET[opts.k % 32]}qq`,
    k: opts.k,
  };
}

export const LIGHTNING_STEPS = [
  {
    id: "parse",
    title: "Lire l’offre",
    detail: "Le portefeuille extrait lno de l’URI. L’offre est statique, signée, réutilisable.",
  },
  {
    id: "onion",
    title: "invoice_request",
    detail: "Onion message via un chemin aveuglé. Le nœud destinataire n’est pas révélé au réseau.",
  },
  {
    id: "invoice",
    title: "Facture fraîche",
    detail: "Le nœud répond avec une facture BOLT 12 : payment_hash unique, montant, expiry.",
  },
  {
    id: "htlc",
    title: "Payer le HTLC",
    detail: "Routage Lightning classique. Chaque saut ne voit que le hop suivant.",
  },
  {
    id: "settle",
    title: "Révélation du preimage",
    detail: "Le destinataire révèle le preimage. Le paiement se règle en secondes, hors chaîne.",
  },
] as const;

export const SILENT_STEPS = [
  {
    id: "inputs",
    title: "Inputs éligibles",
    detail: "P2TR, P2WPKH, P2SH-P2WPKH ou P2PKH contrôlés par l’expéditeur. On somme les pubkeys.",
  },
  {
    id: "hash",
    title: "input_hash",
    detail: "Hash(outpoint le plus petit ∥ A). Empêche qu’un même expéditeur soit lié d’un paiement à l’autre.",
  },
  {
    id: "ecdh",
    title: "Secret partagé",
    detail: "ECDH : input_hash · a · Bscan. Seuls Alice et le scan de Silex peuvent le recalculer.",
  },
  {
    id: "tweak",
    title: "Sortie Taproot",
    detail: "P = Bm + Hash(secret ∥ k)·G. Une adresse bc1p… neuve, indiscernable d’un Taproot banal.",
  },
  {
    id: "scan",
    title: "Détection silencieuse",
    detail: "Le scanner de Silex parcourt les filtres compacts, recalcule P, reconnaît la sortie. Rien on-chain ne pointe vers sp1q.",
  },
] as const;

export function satsToBtc(sats: number) {
  return sats / 100_000_000;
}

export function formatSats(sats: number) {
  return new Intl.NumberFormat("fr-FR").format(sats);
}

export function formatBtc(sats: number) {
  return satsToBtc(sats).toFixed(8).replace(/\.?0+$/, "") + " BTC";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function stepMs() {
  return prefersReducedMotion() ? 40 : 520;
}
