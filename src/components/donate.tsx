import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Heart, LoaderCircle, RotateCcw, X, Zap } from "lucide-react";
import { AnimateNumber } from "@/components/animate-number";
import { PaymentExplosion } from "@/components/payment-explosion";
import { QrMark } from "@/components/qr-mark";
import { Button } from "@/components/ui/button";
import { checkPaymentSettled, getBolt11Invoice } from "@/lib/bolt12";
import { RECIPIENT } from "@/lib/identity";
import { formatBtc, formatSats } from "@/lib/simulate";
import { cn } from "@/lib/utils";

const AMOUNTS = [21_000, 100_000, 500_000, 2_100_000];
const POLL_MS = 3000;

type Phase = "amount" | "creating" | "invoice" | "settled" | "error";

/**
 * Bouton « Donner » + modale de don Lightning réel.
 *
 * Flux : montant → facture BOLT 11 réelle (bolt12-server, via le tunnel
 * bolt.21pay.org) → QR scannable → poll du nœud → ⚡ au vrai règlement.
 * Clé API côté serveur uniquement ; rien de secret dans le bundle client.
 */
export function DonateButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(21_000);
  const [custom, setCustom] = useState("");
  const [phase, setPhase] = useState<Phase>("amount");
  const [invoice, setInvoice] = useState("");
  const [paymentHash, setPaymentHash] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  const effectiveAmount = useMemo(() => {
    const n = Number.parseInt(custom, 10);
    return custom !== "" && Number.isFinite(n) && n > 0 ? n : amount;
  }, [custom, amount]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    },
    [],
  );

  function close() {
    if (pollRef.current) window.clearTimeout(pollRef.current);
    pollRef.current = null;
    setOpen(false);
    setPhase("amount");
    setInvoice("");
    setPaymentHash("");
    setError("");
    setCopied(false);
  }

  async function createInvoice() {
    setPhase("creating");
    setError("");
    try {
      const res = await getBolt11Invoice({
        data: { amountSats: effectiveAmount, description: `Don ${RECIPIENT.handle}` },
      });
      if (!res.paymentRequest) throw new Error("facture vide");
      setInvoice(res.paymentRequest);
      setPaymentHash(res.paymentHash);
      setPhase("invoice");
      poll(res.paymentHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setPhase("error");
    }
  }

  function poll(hash: string) {
    pollRef.current = window.setTimeout(async () => {
      try {
        const res = await checkPaymentSettled({ data: { paymentHash: hash } });
        if (res.settled) {
          setPhase("settled");
          return;
        }
      } catch {
        /* nœud momentanément injoignable — on réessaie */
      }
      poll(hash);
    }, POLL_MS);
  }

  async function copyInvoice() {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const lightningUri = invoice ? `lightning:${invoice}` : "";

  return (
    <>
      <PaymentExplosion trigger={phase === "settled"} />
      <Button size="lg" onClick={() => setOpen(true)}>
        <Heart />
        Donner
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Donner en Lightning"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[0_0_0_1px_var(--color-border),0_24px_64px_rgba(0,0,0,0.6)]">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Don Lightning
                </p>
                <h2 className="mt-0.5 font-display text-2xl text-fg">
                  Soutenir {RECIPIENT.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-muted transition-colors duration-[var(--motion-quick)] hover:bg-surface-2 hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="p-5">
              {phase === "amount" && (
                <div className="space-y-5">
                  <p className="font-mono text-sm text-fg">₿{RECIPIENT.display}</p>
                  <fieldset>
                    <legend className="text-xs text-subtle">Montant</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {AMOUNTS.map((sats) => (
                        <button
                          key={sats}
                          type="button"
                          onClick={() => {
                            setAmount(sats);
                            setCustom("");
                          }}
                          className={cn(
                            "h-10 rounded-full px-3.5 text-sm tabular-nums transition-colors duration-[var(--motion-quick)]",
                            custom === "" && amount === sats
                              ? "bg-accent text-accent-fg"
                              : "bg-surface-2 text-muted hover:text-fg",
                          )}
                        >
                          {formatSats(sats)} sats
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="Montant personnalisé (sats)"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      className="mt-3 h-11 w-full rounded-[var(--radius-sm)] bg-bg px-3 text-sm tabular-nums text-fg shadow-[inset_0_0_0_1px_var(--color-border)] placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <p className="mt-2 text-xs tabular-nums text-muted">
                      <AnimateNumber value={effectiveAmount} format={formatBtc} />
                    </p>
                  </fieldset>
                  <Button className="w-full" size="lg" onClick={createInvoice}>
                    <Zap />
                    Créer la facture
                  </Button>
                  <p className="text-center text-xs text-subtle">
                    Facture BOLT 11 réelle · règlement détecté sur ton nœud.
                  </p>
                </div>
              )}

              {phase === "creating" && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <LoaderCircle className="size-6 animate-spin text-electric" />
                  <p className="text-sm text-muted">Génération de la facture…</p>
                </div>
              )}

              {phase === "error" && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-fg">Impossible de créer la facture.</p>
                  <p className="max-w-xs break-all font-mono text-[11px] text-muted">{error}</p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" onClick={() => setPhase("amount")}>
                      <RotateCcw />
                      Réessayer
                    </Button>
                  </div>
                </div>
              )}

              {(phase === "invoice" || phase === "settled") && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <QrMark payload={lightningUri} className="w-56" label="Facture Lightning" />
                  <div>
                    <p className="text-sm text-fg">Scannez avec votre wallet Lightning</p>
                    <p className="mt-1 text-xs text-muted">
                      <AnimateNumber value={effectiveAmount} format={formatSats} /> sats
                    </p>
                  </div>
                  {phase === "invoice" ? (
                    <div className="flex w-full flex-col items-center gap-3">
                      <Button variant="outline" className="w-full" onClick={copyInvoice}>
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Copiée" : "Copier la facture"}
                      </Button>
                      <p className="flex items-center gap-2 text-xs text-subtle">
                        <LoaderCircle className="size-3.5 animate-spin text-electric" />
                        En attente du règlement…
                      </p>
                      <p className="break-all font-mono text-[10px] leading-relaxed text-subtle">
                        {invoice}
                      </p>
                    </div>
                  ) : (
                    <div className="flex w-full flex-col items-center gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-success">
                        Paiement reçu
                      </p>
                      <p className="font-display text-3xl text-fg">Merci ⚡</p>
                      <Button className="w-full" onClick={close}>
                        Fermer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
