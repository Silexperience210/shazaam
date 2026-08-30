import { useState } from "react";
import {
  ArrowDown,
  Cpu,
  Fingerprint,
  Globe,
  KeyRound,
  Radio,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type LayerId, RECIPIENT, STACK_LAYERS, buildUri } from "@/lib/identity";
import { cn } from "@/lib/utils";

const ICONS: Record<LayerId, typeof Globe> = {
  human: Fingerprint,
  dns: Globe,
  uri: Radio,
  lightning: Zap,
  silent: Shield,
  wallet: KeyRound,
};

export function StackView() {
  const [active, setActive] = useState<LayerId>("human");
  const layer = STACK_LAYERS.find((l) => l.id === active)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start">
      <ol className="flex flex-col">
        {STACK_LAYERS.map((item, i) => {
          const Icon = ICONS[item.id];
          const selected = item.id === active;
          return (
            <li key={item.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition-colors duration-[var(--motion-fast)]",
                  selected ? "bg-surface" : "hover:bg-surface/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]",
                    selected ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-[0.14em] text-subtle">
                    {item.kicker} · {item.protocol}
                  </span>
                  <span className="mt-0.5 block text-sm text-fg">{item.title}</span>
                </span>
              </button>
              {i < STACK_LAYERS.length - 1 && (
                <div className="flex h-4 items-center pl-[1.9rem]" aria-hidden="true">
                  <ArrowDown className="size-3.5 text-border-strong" />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <aside className="rounded-[var(--radius-xl)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6">
        <Badge variant="quiet">{layer.protocol}</Badge>
        <h2 className="mt-3 font-display text-3xl text-fg sm:text-4xl">{layer.title}</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{layer.summary}</p>
        <div className="mt-6">
          <LayerDetail id={active} />
        </div>
      </aside>
    </div>
  );
}

function LayerDetail({ id }: { id: LayerId }) {
  switch (id) {
    case "human":
      return (
        <Spec
          rows={[
            ["Affichage", `₿${RECIPIENT.display}`],
            ["Usage", "Carte, oral, facture, site, donation"],
            ["Propriété", "Jamais régénéré. Pas une adresse."],
          ]}
        />
      );
    case "dns":
      return (
        <Spec
          rows={[
            ["Nom DNS", RECIPIENT.dnsHost],
            ["Type", "TXT + DNSSEC"],
            ["Sans", "HTTP, LNURL, serveur d’alias"],
          ]}
        />
      );
    case "uri":
      return (
        <div className="space-y-4">
          <p className="break-all rounded-[var(--radius-sm)] bg-bg p-3 font-mono text-[11px] leading-relaxed text-muted shadow-[inset_0_0_0_1px_var(--color-border)]">
            {buildUri()}
          </p>
          <Spec
            rows={[
              ["lno", "Offre BOLT 12 réutilisable"],
              ["sp", "Adresse Silent Payment"],
              ["address", "Vide — pas de bc1q réutilisé"],
            ]}
          />
        </div>
      );
    case "lightning":
      return (
        <Spec
          rows={[
            ["Offre", RECIPIENT.lno.slice(0, 28) + "…"],
            ["Transport", "Onion messages, chemins aveuglés"],
            ["Par paiement", "invoice + payment_hash uniques"],
            ["Nœud", `${RECIPIENT.nodeAlias} · solde chaud limité`],
          ]}
        />
      );
    case "silent":
      return (
        <Spec
          rows={[
            ["Adresse", RECIPIENT.sp.slice(0, 22) + "…"],
            ["Scan", "Bscan / bscan (watch-only)"],
            ["Spend", "Bspend / bspend (airgap)"],
            ["On-chain", "P2TR unique, indiscernable"],
          ]}
        />
      );
    case "wallet":
      return <WalletSplit />;
  }
}

function Spec({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-border rounded-[var(--radius-md)] bg-bg shadow-[inset_0_0_0_1px_var(--color-border)]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-xs text-subtle">{k}</dt>
          <dd className="break-all font-mono text-xs text-fg sm:text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function WalletSplit() {
  const boxes = [
    {
      icon: Globe,
      title: "DNS",
      body: "Zone DNSSEC chez le registrar. Hors ligne vis-à-vis des fonds. Publie l’URI, rien d’autre.",
    },
    {
      icon: Radio,
      title: "Scanner",
      body: "Watch-only, toujours allumé. Détient bscan. Filtres compacts BIP-158. Ne peut pas signer.",
    },
    {
      icon: Zap,
      title: "Nœud LN",
      body: "Core Lightning, offres BOLT 12. Solde opérationnel. Chemins aveuglés. Isolé du cold storage.",
    },
    {
      icon: Cpu,
      title: "SeedSigner",
      body: "bspend airgap. PSBT en QR quand le scanner signale une sortie. Multi-sig possible plus tard.",
    },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {boxes.map((b) => (
        <li
          key={b.title}
          className="rounded-[var(--radius-md)] bg-bg p-3 shadow-[inset_0_0_0_1px_var(--color-border)]"
        >
          <p className="flex items-center gap-2 text-sm text-fg">
            <b.icon className="size-3.5 text-muted" />
            {b.title}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{b.body}</p>
        </li>
      ))}
    </ul>
  );
}
