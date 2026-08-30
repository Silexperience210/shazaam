import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { CompareUx } from "@/components/compare-ux";
import { IdentityCard } from "@/components/identity-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { RECIPIENT } from "@/lib/identity";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-end lg:gap-12 lg:pt-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              BIP-352 · BOLT 12 · BIP-353
            </p>
            <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] text-fg sm:text-6xl">
              Un identifiant.
              <span className="block italic text-muted"> Pour de bon.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Silent Payments et une offre Lightning statique dans le même QR. Le
              portefeuille dérive une destination neuve à chaque paiement — on-chain
              ou Lightning — sans interaction, sans réutilisation, sans serveur web.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/lab">
                  Ouvrir le laboratoire
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/stack">Voir l’architecture</Link>
              </Button>
            </div>
          </div>
          <IdentityCard />
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          <Stat n="1" k="identifiant" d={`₿${RECIPIENT.display} — dictable, imprimable, éternel.`} />
          <Stat n="2" k="rails" d="Lightning d’abord. Silent Payment en repli. Un bouton." />
          <Stat n="∞" k="adresses" d="Chaque paiement produit une sortie ou un hash unique." />
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2">
          <RailCard
            icon={Zap}
            kicker="Rail A"
            title="Lightning statique"
            protocol="BOLT 12"
            body="L’offre ne change jamais. Chaque paiement demande une facture fraîche par onion message, avec chemins aveuglés. Pas de LNURL, pas d’HTTPS vers le destinataire."
          />
          <RailCard
            icon={Shield}
            kicker="Rail B"
            title="On-chain silencieux"
            protocol="BIP-352"
            body="L’expéditeur dérive une sortie Taproot par ECDH sur ses propres inputs. L’adresse sp1q n’apparaît jamais à la chaîne. Le destinataire scanne, sans notification."
          />
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl text-fg sm:text-4xl">Pourquoi c’est le killer app</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Bitcoin a toujours su payer. Il n’a jamais eu un identifiant unique, privé,
            et dual-rail. C’est exactement le trou que comblent Silent Payments + BOLT 12
            dans une enveloppe BIP-321, résolue par DNSSEC.
          </p>
          <div className="mt-8">
            <CompareUx />
          </div>
        </section>

        <section className="mt-16 rounded-[var(--radius-xl)] bg-surface px-5 py-8 shadow-[inset_0_0_0_1px_var(--color-border)] sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
            Politique de routage
          </p>
          <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-fg sm:text-sm">
            {`if lightning_reachable(offer):
    pay_bolt12(invoice_request)
else:
    pay_silent(derive_taproot(inputs, Bscan))
# jamais réutiliser une adresse classique`}
          </pre>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            L’expéditeur ne choisit pas le rail. Alice paie Rob. Le portefeuille
            décide. C’est toute l’UX.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}

function Stat({ n, k, d }: { n: string; k: string; d: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <p className="font-display text-4xl text-fg">{n}</p>
      <p className="mt-1 text-sm text-fg">{k}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
    </div>
  );
}

function RailCard({
  icon: Icon,
  kicker,
  title,
  protocol,
  body,
}: {
  icon: typeof Zap;
  kicker: string;
  title: string;
  protocol: string;
  body: string;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] bg-bg-elevated p-5 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-subtle">
        <Icon className="size-3.5" />
        {kicker} · {protocol}
      </p>
      <h3 className="mt-3 font-display text-2xl text-fg">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
