const TODAY = [
  "Nouvelle adresse à chaque facture, sinon clustering",
  "Lightning Address = HTTP + LNURL, fuite d’IP",
  "Deux QR, deux identités, deux habitudes",
  "Facture BOLT 11 périmée en quinze minutes",
  "BIP-47 exige une transaction de notification",
];

const UMBRA = [
  "Un nom à vie, gravable, dictable, imprimable",
  "DNSSEC + onion messages, aucun serveur web",
  "Un QR, deux rails, un bouton Payer",
  "Offre BOLT 12 permanente, facture fraîche à la volée",
  "Silent Payment : sortie Taproot unique, indiscernable",
];

export function CompareUx() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Column title="Aujourd’hui" items={TODAY} muted />
      <Column title="Umbra" items={UMBRA} />
    </section>
  );
}

function Column({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? "rounded-[var(--radius-lg)] bg-bg-elevated p-5 shadow-[inset_0_0_0_1px_var(--color-border)]"
          : "rounded-[var(--radius-lg)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
      }
    >
      <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-subtle">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-muted" />
            <span className={muted ? "text-muted" : "text-fg"}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
