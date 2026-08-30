export const RECIPIENT = {
  name: "Silex",
  handle: "silex@21pay.org",
  display: "silex@21pay.org",
  dnsHost: "silex.user._bitcoin-payment.21pay.org",
  dnsType: "TXT",
  label: "21pay",
  scanPub:
    "02c8a3f0e1d94b6c7a2f91d0b4e8c6a1f3d5b7c9e0a2d4f6b8c0e2a4d6f8b0c2e4",
  spendPub:
    "03a91c4e7b2d80f5c6e1a3b9d0f2c4e6a8b0d2f4c6e8a0b2d4f6c8e0a2b4d6f8c0",
  sp: "sp1qqgste7k9hx0dql4cu80wv2rqxevajuz34em0d5jkkf0n4w5q8n2k42u7w0s3jn54",
  lno: "lno1zcss9mk8y3wle8tee4gef8ty6cvwgum7ghj9npqpqssyh3w4x5k7m9n2p4r6t8v0w1y3z5a7c9e",
  nodeAlias: "21pay",
} as const;

export const SENDER = {
  name: "Alice",
  wallet: "Umbra",
} as const;

export function buildUri(opts?: { amountBtc?: number; memo?: string }) {
  const params = new URLSearchParams();
  params.set("lno", RECIPIENT.lno);
  params.set("sp", RECIPIENT.sp);
  if (opts?.amountBtc && opts.amountBtc > 0) {
    params.set("amount", trimAmount(opts.amountBtc));
  }
  params.set("label", RECIPIENT.label);
  if (opts?.memo) params.set("message", opts.memo);
  return `bitcoin:?${params.toString()}`;
}

export function dnsRecord(uri: string) {
  return `"bitcoin ${uri.slice("bitcoin:".length)}"`;
}

function trimAmount(n: number) {
  const s = n.toFixed(8);
  return s.replace(/\.?0+$/, "") || "0";
}

export const STACK_LAYERS = [
  {
    id: "human",
    kicker: "Couche 0",
    title: "Identité humaine",
    protocol: "BIP-353",
    summary:
      "Un nom du type utilisateur@domaine. Rien à régénérer, rien à négocier. C’est ce que tu donnes, graves, ou mets sur une carte de visite.",
  },
  {
    id: "dns",
    kicker: "Couche 1",
    title: "Résolution DNSSEC",
    protocol: "BIP-353",
    summary:
      "Le portefeuille interroge un enregistrement TXT signé DNSSEC. Pas d’HTTP, pas de serveur LNURL, pas de fuite d’IP vers le destinataire.",
  },
  {
    id: "uri",
    kicker: "Couche 2",
    title: "Enveloppe unifiée",
    protocol: "BIP-321",
    summary:
      "Un URI bitcoin: qui porte deux méthodes réutilisables et privées : une offre Lightning (lno) et une adresse Silent Payment (sp). Aucune adresse classique.",
  },
  {
    id: "lightning",
    kicker: "Rail A",
    title: "Lightning statique",
    protocol: "BOLT 12",
    summary:
      "L’offre est permanente. Chaque paiement déclenche un invoice_request en onion message, une facture fraîche, un payment_hash unique, des chemins aveuglés.",
  },
  {
    id: "silent",
    kicker: "Rail B",
    title: "On-chain silencieux",
    protocol: "BIP-352",
    summary:
      "L’expéditeur dérive une sortie Taproot unique par ECDH sur ses inputs. L’adresse sp1q n’apparaît jamais on-chain. Aucune transaction de notification.",
  },
  {
    id: "wallet",
    kicker: "Couche 3",
    title: "Portefeuille séparé",
    protocol: "Scan / spend",
    summary:
      "Clé de scan chaude (watch-only). Clé de dépense froide (SeedSigner). Nœud Lightning à solde limité. DNS indépendant. Aucun point unique de compromission.",
  },
] as const;

export type LayerId = (typeof STACK_LAYERS)[number]["id"];
