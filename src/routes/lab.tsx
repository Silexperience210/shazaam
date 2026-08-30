import { createFileRoute } from "@tanstack/react-router";
import { PayLab } from "@/components/pay-lab";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/lab")({ component: LabPage });

function LabPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
          Laboratoire
        </p>
        <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">
          Alice paie Silex.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Un nom, un montant, un bouton. Coupe Lightning pour forcer le repli
          Silent Payment. Observe une destination neuve à chaque règlement — l’identifiant,
          lui, ne bouge pas.
        </p>
        <div className="mt-10">
          <PayLab />
        </div>
      </div>
    </SiteShell>
  );
}
