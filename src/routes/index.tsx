import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { BtcTicker } from "@/components/btc-ticker";
import { IdentityCard } from "@/components/identity-card";
import { Lightning } from "@/components/lightning";
import { Magnetic } from "@/components/magnetic";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { RECIPIENT } from "@/lib/identity";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="relative grid items-center gap-10 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6 lg:pt-16">
          {/* Éclair 3D réel, en fond côté identité */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
            <Lightning className="size-full" />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-electric">
              Recevoir en Bitcoin — un nom suffit
            </p>
            <h1 className="mt-4 font-display text-[2.9rem] leading-[1.02] text-fg sm:text-6xl">
              Un nom.
              <span className="block text-electric">Deux rails.</span>
              <span className="block italic text-muted">Zéro adresse réutilisée.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              ₿{RECIPIENT.display}. Scanne le QR ou copie le nom. Lightning d'abord,
              Silent Payment en repli — une destination neuve à chaque paiement, sans
              serveur web, sans adresse classique.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-xs text-subtle">
              <span className="inline-block size-1.5 animate-pulse-glow rounded-full bg-electric" />
              <BtcTicker />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <Button asChild size="lg">
                  <Link to="/lab">
                    Payer
                    <ArrowRight />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic strength={0.6}>
                <Button asChild size="lg" variant="outline">
                  <Link to="/stack">Voir l'architecture</Link>
                </Button>
              </Magnetic>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <RailPill icon={Zap} label="BOLT 12 · Lightning" />
              <RailPill icon={Shield} label="BIP-352 · Silent Payment" />
            </div>
          </div>

          <div className="relative z-10">
            <IdentityCard />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function RailPill({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs text-muted">
      <Icon className="size-3.5 text-electric" />
      {label}
    </span>
  );
}
