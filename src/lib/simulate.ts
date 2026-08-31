import { RECIPIENT } from "./identity";
import {
  bytesToHex,
  deriveSilentPaymentOutputs,
  generateInputKey,
} from "./silent-payments";
import { getBolt12Invoice } from "./bolt12";

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

function randomHex(nBytes: number): string {
  const b = new Uint8Array(nBytes);
  crypto.getRandomValues(b);
  return bytesToHex(b);
}

/**
 * Dérivation Silent Payment (BIP-352) RÉELLE.
 *
 * Alice génère un input neuf (clé + outpoint aléatoire) à chaque paiement :
 * l'adresse bc1p produite est donc distincte à chaque règlement, indiscernable
 * d'un Taproot banal, et ne révèle jamais l'identifiant sp1q on-chain.
 */
export function deriveSilentPayment(): Pick<
  Receipt,
  "taprootOutput" | "sharedSecret" | "inputHash" | "k" | "id"
> {
  const { privKey, pubKey } = generateInputKey();
  const res = deriveSilentPaymentOutputs({
    inputs: [{ privKey, pubKey }],
    outpoints: [{ txid: randomHex(32), vout: 0 }],
    recipients: [{ scanPub: RECIPIENT.scanPub, spendPub: RECIPIENT.spendPub }],
  });
  const out = res.outputs[0];
  return {
    id: res.inputHash.slice(0, 16),
    taprootOutput: out.address,
    sharedSecret: res.sharedSecret,
    inputHash: res.inputHash,
    k: out.k,
  };
}

/**
 * Facture BOLT 12 RÉELLE depuis l'offre `silex@silexperience.org`, via le bolt12-server
 * (LNDK). La clé API vit côté serveur (env BOLT12_API_KEY) — jamais dans le bundle.
 *
 * Si le bolt12-server est injoignable ou que l'invoice_request n'aboutit pas
 * (cas « self-payment » encore en timeout), on renvoie un état explicite au lieu
 * d'inventer une fausse facture.
 */
export async function deriveLightningInvoice(opts: {
  amountSats: number;
}): Promise<Pick<Receipt, "paymentHash" | "preimage" | "invoice" | "k" | "id">> {
  try {
    const result = await getBolt12Invoice({
      data: { offer: RECIPIENT.lno, amountSats: opts.amountSats },
    });
    const invoice = result.invoice;
    return {
      id: invoice.slice(0, 16) || randomHex(8),
      paymentHash: result.paymentHash || "—",
      preimage: "révélé au règlement",
      invoice,
      k: 0,
    };
  } catch (err) {
    return {
      id: randomHex(8),
      paymentHash: "—",
      preimage: "—",
      invoice: `BOLT12 indisponible — ${err instanceof Error ? err.message : "erreur"}`,
      k: 0,
    };
  }
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
