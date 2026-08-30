// Validation du module silent-payments.ts contre les vecteurs de test BIP-352 (émission).
// Usage : node --experimental-strip-types scripts/validate-sp.ts
import { readFileSync } from "node:fs";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { deriveSilentPaymentOutputs } from "../src/lib/silent-payments.ts";

const vectors = JSON.parse(readFileSync("/tmp/sp-vectors.json", "utf8"));

const NUMS_H = "50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0";

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function bytesToHex(b: Uint8Array): string {
  return Buffer.from(b).toString("hex");
}

function readVarInt(b: Uint8Array, i: number): { value: number; offset: number } {
  const first = b[i++];
  if (first < 0xfd) return { value: first, offset: i };
  if (first === 0xfd) return { value: b[i] | (b[i + 1] << 8), offset: i + 2 };
  if (first === 0xfe) {
    return { value: (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0, offset: i + 4 };
  }
  throw new Error("varint 0xff non supporté");
}

// Pousse les données des pushdata d'un script (les opcodes sans données sont ignorés).
function scriptPushes(scriptHex: string): Uint8Array[] {
  const b = hexToBytes(scriptHex);
  const items: Uint8Array[] = [];
  let i = 0;
  while (i < b.length) {
    const op = b[i++];
    if (op <= 0x4b) {
      items.push(b.subarray(i, i + op));
      i += op;
    } else if (op === 0x4c) {
      const n = b[i++];
      items.push(b.subarray(i, i + n));
      i += n;
    } else if (op === 0x4d) {
      const n = b[i] | (b[i + 1] << 8);
      i += 2;
      items.push(b.subarray(i, i + n));
      i += n;
    } else if (op === 0x4e) {
      const n = (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
      i += 4;
      items.push(b.subarray(i, i + n));
      i += n;
    }
    // sinon : opcode sans donnée, ignoré
  }
  return items;
}

function witnessStack(witnessHex: string): Uint8Array[] {
  if (!witnessHex || witnessHex.length === 0) return [];
  const b = hexToBytes(witnessHex);
  const { value: count, offset } = readVarInt(b, 0);
  const items: Uint8Array[] = [];
  let i = offset;
  for (let n = 0; n < count; n++) {
    const r = readVarInt(b, i);
    i = r.offset;
    items.push(b.subarray(i, i + r.value));
    i += r.value;
  }
  return items;
}

type Extracted = { pubKey: string; taproot: boolean };

// Extrait la clé publique d'un input (miroir de get_pubkey_from_input de reference.py).
function getPubkeyFromInput(vin: any): Extracted | null {
  const spk: string = vin.prevout.scriptPubKey.hex;

  if (spk.startsWith("5120")) {
    // P2TR : clé x-only depuis le scriptPubKey.
    const stack = witnessStack(vin.txinwitness);
    const w = [...stack];
    if (w.length > 1 && w[w.length - 1][0] === 0x50) w.pop(); // annexe
    if (w.length > 1) {
      // script-path : clé interne dans le control block
      const controlBlock = w[w.length - 1];
      const internalKey = controlBlock.subarray(1, 33);
      if (bytesToHex(internalKey) === NUMS_H) return null; // NUMS H → skip
    }
    return { pubKey: spk.slice(4), taproot: true };
  }
  if (spk.startsWith("0014")) {
    // P2WPKH : dernier élément du witness.
    const stack = witnessStack(vin.txinwitness);
    const pub = stack[stack.length - 1];
    return pub && pub.length === 33 ? { pubKey: bytesToHex(pub), taproot: false } : null;
  }
  if (spk.startsWith("76a914")) {
    // P2PKH : trouver la clé compressée dont hash160 == hash du scriptPubKey
    // (fenêtre glissante de 33 octets depuis la fin — gère les scriptSigs malléés).
    const spkHash = hexToBytes(spk.slice(6, 46));
    const b = hexToBytes(vin.scriptSig);
    for (let i = b.length; i >= 33; i--) {
      const pub = b.subarray(i - 33, i);
      if ((pub[0] === 0x02 || pub[0] === 0x03) && bytesToHex(hash160(pub)) === bytesToHex(spkHash)) {
        return { pubKey: bytesToHex(pub), taproot: false };
      }
    }
    return null;
  }
  if (spk.startsWith("a914")) {
    // P2SH : redeemScript P2WPKH (0014…) → clé dans le witness.
    const items = scriptPushes(vin.scriptSig);
    const redeem = items[items.length - 1];
    if (redeem && redeem.length === 22 && redeem[0] === 0x00 && redeem[1] === 0x14) {
      const stack = witnessStack(vin.txinwitness);
      const pub = stack[stack.length - 1];
      return pub && pub.length === 33 ? { pubKey: bytesToHex(pub), taproot: false } : null;
    }
    return null;
  }
  return null;
}

let cases = 0;
let outputsChecked = 0;
const failures: string[] = [];

for (const tc of vectors) {
  for (const sending of tc.sending) {
    cases++;
    const { vin, recipients } = sending.given;
    const expected = sending.expected;

    const inputs: { privKey: string; pubKey: string; taproot: boolean }[] = [];
    const outpoints: { txid: string; vout: number }[] = [];
    for (const v of vin) {
      outpoints.push({ txid: v.txid, vout: v.vout });
      const ex = getPubkeyFromInput(v);
      if (!ex) continue;
      inputs.push({ privKey: v.private_key, pubKey: ex.pubKey, taproot: ex.taproot });
    }

    // Vérif intermédiaire : pubkeys extraites == attendues (taproot : x-only → "02"+x).
    const expectedPubKeys: string[] = expected.input_pub_keys ?? [];
    const normalized = inputs.map((i) => (i.taproot ? "02" + i.pubKey : i.pubKey));
    if (normalized.join(",") !== expectedPubKeys.join(",")) {
      failures.push(`${tc.comment}: pubkeys d'input ${normalized.join(",")} != attendues`);
    }

    let myOutputs: string[] = [];
    if (inputs.length > 0) {
      const recips = [];
      for (const r of recipients) {
        const count = r.count ?? 1;
        for (let i = 0; i < count; i++) recips.push({ scanPub: r.scan_pub_key, spendPub: r.spend_pub_key });
      }
      try {
        const res = deriveSilentPaymentOutputs({ inputs, outpoints, recipients: recips });
        myOutputs = res.outputs.map((o) => o.xonly);
      } catch (e) {
        // a=0, K_max, scalaire invalide → échec attendu → sorties vides.
        myOutputs = [];
      }
    }

    const mySet = new Set(myOutputs);
    const matched = (expected.outputs ?? []).some(
      (lst: string[]) => lst.length === mySet.size && lst.every((x) => mySet.has(x)),
    );
    if (!matched) {
      failures.push(`${tc.comment}: sorties ${JSON.stringify(myOutputs)} ne matchent pas ${JSON.stringify(expected.outputs)}`);
    }
    outputsChecked += myOutputs.length;
  }
}

console.log(`cas d'émission : ${cases} | sorties vérifiées : ${outputsChecked}`);
if (failures.length) {
  console.log(`ÉCHECS : ${failures.length}`);
  for (const f of failures.slice(0, 40)) console.log(" - " + f);
  process.exit(1);
} else {
  console.log("OK — toutes les sorties correspondent aux vecteurs BIP-352.");
}
