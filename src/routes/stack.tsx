import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { StackView } from "@/components/stack-view";

export const Route = createFileRoute("/stack")({ component: StackPage });

function StackPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
          Architecture
        </p>
        <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">
          Quatre machines, zéro adresse réutilisée.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          DNS, scanner watch-only, nœud Lightning, et un SeedSigner. Chaque couche
          peut tomber sans emporter les fonds. Clique une couche pour voir ce qu’elle
          publie, ce qu’elle détient, et ce qu’elle ne peut pas faire.
        </p>
        <div className="mt-10">
          <StackView />
        </div>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <Note
            title="Confiance"
            body="Le DNS est signé (DNSSEC). L’offre BOLT 12 est signée par le nœud. La sortie Silent Payment n’est valable que pour le spend key. Aucun serveur web dans le chemin."
          />
          <Note
            title="Vie privée"
            body="Pas d’adresse réutilisée, pas de notification on-chain, pas de requête HTTP vers le destinataire. Les paiements Lightning et on-chain sont mutuellement non corrélables."
          />
          <Note
            title="Dégradation"
            body="LN down : Silent Payment. Scanner down : les fonds restent, la détection attend. SeedSigner perdu : le scan ne dépense rien. DNS down : l’URI peut encore se partager en QR."
          />
        </section>
      </div>
    </SiteShell>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <h2 className="text-sm font-medium text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
