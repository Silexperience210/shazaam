import { useEffect, useState } from "react";

/** Prix BTC live (EUR) — repli silencieux si injoignable. */
export function BtcTicker({ className }: { className?: string }) {
  const [eur, setEur] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const fetchPrice = async () => {
      try {
        const r = await fetch("https://mempool.space/api/v1/prices");
        if (!r.ok) return;
        const d = (await r.json()) as { EUR?: number };
        if (alive && typeof d.EUR === "number") setEur(d.EUR);
      } catch {
        /* réseau indisponible : on n'affiche rien */
      }
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (eur == null) return null;
  return (
    <span className={className}>
      1 ₿ ≈ {eur.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
    </span>
  );
}
