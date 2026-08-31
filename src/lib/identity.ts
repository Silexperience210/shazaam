export const RECIPIENT = {
  name: "Silex",
  handle: "silex@21pay.org",
  display: "silex@21pay.org",
  dnsHost: "silex.user._bitcoin-payment.21pay.org",
  dnsType: "TXT",
  label: "21pay",
  scanPub:
    "03eeba6e494e05eb6ee6bbe7b852eb0102b9a0bd0f4cfc6a8cf8057fc2514958a1",
  spendPub:
    "037879f533bb6689707dd69ad168d9789e5e32742dffff5ede993613664ddace74",
  sp: "sp1qq0ht5mjffcz7kmhxh0nms5htqyptng9apax0c65vlqzhlsj3f9v2zqmc086n8wmx39c8m456695dj7y7tce8gt0lla0daxfkzdnymkkwws9put0u",
  lno: "lno1pg8hx6tvv4uyqv33wpshjtn0wfn3plgzhqpaxtjkrr04rr53rckqhargd6wjx6hf4v9063p0pfw79zm56epn3vcrhtzq7rdrlxgkkumgxrgwag35uf75sq589psvk0mg6ck8wddrwzyqyqhra00lfz8hcw88atkfmdagvfy46k35dqgl3yc09d54535ehkh8kgqrxfawmukzp9qjr7maazvyhyvhzq8ukgsfx5ejj463fy772v9dcs962ls0kh906v56thz5wzw2773e2305uysre33f6kvd40cfeeakhs9ax4v9538ta927gqedgdwzzu9vkw08zvssqtz4uuel4kjv8uv3gqhh7md9yqcasdv5l5u5fzv8x5ayktn0adl64re9sen9ywlqdrg3wxgykqhsdkefg0fk7f7hjgzl96q9kt0gglwkzuml49ad4m9p7caq4qkllqp5pcyrkjqmutv366js83d6xrclh824jfxye587nf6k08p7kzkf20gzqws54xx98velg6d8z5nfmazgdutfwzx53m6kq4jmqdcukd3uy446uqpn6nq2etndupkph6v4u45uhvjh8f029j7clchrjz5yj569tuct0z0sqvhzcv44rlswynyyz8yq38vw3p52ugpa77lgsl5qxuww6s6ngvar04a69jlf0fy5n99r3084jy5jhdyq50gq9ncalxajn3q6jvussjdp3nfxz0czrpmvh8ft5p8cwtt0skxa4qdygalg83hekwx37fghffzxqgrdgp4r593fc4t3s2jmeguwzn8gee6ap8y8ketakvt48xyfpc3gyqc3k8j5zez5zclujtulrndns60da5x5y7sk2zg5s7j4s250cmn5f5pqyq8zqr994kejafplvk4fefk36pk5d0v4y5dfeth9pdslcasxpugxqqe6mywntmtznjxvdt0ywujhcnf69xymrfcet3d5sn9zuswx9g399k6leq9scysexnwkek3ftvl6hlyrvxrhsq57q740c0z6c6dm75gft582taww4qxuhmasu9ruvw8lktpc9zhjysqze55z4zc2xg5dqe9vwpppn5st8wqpdnch3jxtwez3n36rmxqu7xzj07dn50vcgjgzu9rvntd3ypfjx9cxz7gkyypwe3yfuwc2ypsux95kxv9n3twhqmmkyhf9quvhpyhcjvgnfe8e4ms",
  nodeAlias: "Plebians-Fr",
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
  // BIP-353 : le TXT contient l'URI `bitcoin:` complet. Le fournisseur DNS
  // (Cloudflare) le découpe en character-strings ≤ 255 octets ; le wallet
  // les concatène sans séparateur (§ resolution du BIP-353).
  return uri;
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
