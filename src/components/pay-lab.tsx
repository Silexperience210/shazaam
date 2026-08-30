import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  Check,
  CloudLightning,
  Link2,
  LoaderCircle,
  Shield,
  Zap,
} from "lucide-react";
import { QrMark } from "@/components/qr-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildUri, RECIPIENT, SENDER } from "@/lib/identity";
import {
  deriveLightningInvoice,
  deriveSilentPayment,
  formatBtc,
  formatSats,
  LIGHTNING_STEPS,
  type Rail,
  type Receipt,
  SILENT_STEPS,
  stepMs,
} from "@/lib/simulate";
import { cn } from "@/lib/utils";

type Phase = "compose" | "resolve" | "ready" | "paying" | "settled";

const AMOUNTS = [21_000, 100_000, 500_000, 2_100_000];

export function PayLab() {
  const [amount, setAmount] = useState(100_000);
  const [lnUp, setLnUp] = useState(true);
  const [phase, setPhase] = useState<Phase>("compose");
  const [step, setStep] = useState(0);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [current, setCurrent] = useState<Receipt | null>(null);
  const timers = useRef<number[]>([]);

  const rail: Rail = lnUp ? "lightning" : "silent";
  const uri = useMemo(() => buildUri({ amountBtc: amount / 100_000_000 }), [amount]);
  const steps = rail === "lightning" ? LIGHTNING_STEPS : SILENT_STEPS;

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function reset() {
    clearTimers();
    setPhase("compose");
    setStep(0);
    setCurrent(null);
  }

  function resolveIdentity() {
    clearTimers();
    setPhase("resolve");
    setStep(0);
    later(stepMs() * 2.2, () => setPhase("ready"));
  }

  async function pay() {
    clearTimers();
    setPhase("paying");
    setStep(0);

    const derived =
      rail === "lightning"
        ? await deriveLightningInvoice({ amountSats: amount })
        : deriveSilentPayment();

    const receipt: Receipt = {
      rail,
      amountSats: amount,
      at: Date.now(),
      ...derived,
    };

    const delay = stepMs();
    steps.forEach((_, i) => {
      later(delay * (i + 1), () => setStep(i + 1));
    });
    later(delay * (steps.length + 1), () => {
      setCurrent(receipt);
      setReceipts((prev) => [receipt, ...prev].slice(0, 8));
      setPhase("settled");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <section className="rounded-[var(--radius-xl)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              {SENDER.wallet} · {SENDER.name}
            </p>
            <h2 className="mt-1 font-display text-3xl text-fg">Payer</h2>
          </div>
          <Badge variant="quiet">{phaseLabel(phase)}</Badge>
        </div>

        <label className="mt-6 block">
          <span className="text-xs text-subtle">Destinataire</span>
          <div className="mt-1.5 flex h-11 items-center rounded-[var(--radius-sm)] bg-bg px-3 font-mono text-sm shadow-[inset_0_0_0_1px_var(--color-border)]">
            ₿{RECIPIENT.handle}
          </div>
        </label>

        <fieldset className="mt-5">
          <legend className="text-xs text-subtle">Montant</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMOUNTS.map((sats) => (
              <button
                key={sats}
                type="button"
                onClick={() => {
                  setAmount(sats);
                  if (phase !== "compose" && phase !== "resolve") reset();
                }}
                className={cn(
                  "h-10 rounded-full px-3.5 text-sm tabular-nums transition-colors duration-[var(--motion-quick)]",
                  amount === sats
                    ? "bg-accent text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                {formatSats(sats)} sats
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted">{formatBtc(amount)}</p>
        </fieldset>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-bg px-3 py-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
          <div>
            <p className="text-sm text-fg">Nœud Lightning joignable</p>
            <p className="text-xs text-muted">
              {lnUp ? "Le routeur choisit BOLT 12." : "Repli automatique sur Silent Payment."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={lnUp}
            onClick={() => {
              setLnUp((v) => !v);
              if (phase !== "compose") reset();
            }}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors duration-[var(--motion-fast)]",
              lnUp ? "bg-accent" : "bg-border-strong",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out)]",
                lnUp ? "translate-x-5 bg-accent-fg" : "translate-x-0 bg-fg",
              )}
            />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {phase === "compose" || phase === "resolve" ? (
            <Button className="flex-1" onClick={resolveIdentity} disabled={phase === "resolve"}>
              {phase === "resolve" ? <LoaderCircle className="animate-spin" /> : <Link2 />}
              {phase === "resolve" ? "Résolution DNSSEC…" : "Résoudre l’identité"}
            </Button>
          ) : (
            <>
              <Button className="flex-1" onClick={pay} disabled={phase === "paying"}>
                {phase === "paying" ? (
                  <LoaderCircle className="animate-spin" />
                ) : rail === "lightning" ? (
                  <Zap />
                ) : (
                  <Shield />
                )}
                {phase === "paying"
                  ? "Paiement en cours"
                  : phase === "settled"
                    ? "Payer à nouveau"
                    : "Payer"}
              </Button>
              <Button variant="ghost" onClick={reset}>
                Réinitialiser
              </Button>
            </>
          )}
        </div>

        {phase !== "compose" && (
          <UriPanel uri={uri} phase={phase} rail={rail} step={step} current={current} />
        )}
      </section>

      <section className="grid gap-6">
        <ReceiverPanel phase={phase} current={current} receipts={receipts} />
        {receipts.length > 0 && <History receipts={receipts} />}
      </section>
    </div>
  );
}

function phaseLabel(phase: Phase) {
  switch (phase) {
    case "compose":
      return "Prêt";
    case "resolve":
      return "DNS";
    case "ready":
      return "URI";
    case "paying":
      return "Transit";
    case "settled":
      return "Réglé";
  }
}

function UriPanel({
  uri,
  phase,
  rail,
  step,
  current,
}: {
  uri: string;
  phase: Phase;
  rail: Rail;
  step: number;
  current: Receipt | null;
}) {
  const steps = rail === "lightning" ? LIGHTNING_STEPS : SILENT_STEPS;
  const active = Math.min(step, steps.length - 1);

  return (
    <div className="mt-6 border-t border-border pt-5">
      {phase === "resolve" && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin" />
          TXT {RECIPIENT.dnsHost}
        </p>
      )}

      {phase !== "resolve" && (
        <>
          <p className="text-xs text-subtle">URI BIP-321</p>
          <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-muted">{uri}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={rail === "lightning" ? "accent" : "quiet"}>lno · Lightning</Badge>
            <Badge variant={rail === "silent" ? "accent" : "quiet"}>sp · Silent</Badge>
          </div>
        </>
      )}

      {(phase === "paying" || phase === "settled") && (
        <ol className="mt-5 space-y-2">
          {steps.map((s, i) => {
            const done = phase === "settled" || i < step;
            const currentStep = phase === "paying" && i === active && step > 0;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors duration-[var(--motion-fast)]",
                  currentStep ? "bg-surface-2" : "bg-transparent",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full text-[10px]",
                      done ? "bg-accent text-accent-fg" : "bg-border text-muted",
                    )}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  <p className="text-sm text-fg">{s.title}</p>
                </div>
                {(currentStep || phase === "settled") && (
                  <p className="mt-1 pl-7 text-xs leading-relaxed text-muted">{s.detail}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {phase === "settled" && current && <ReceiptFacts receipt={current} />}
    </div>
  );
}

function ReceiptFacts({ receipt }: { receipt: Receipt }) {
  if (receipt.rail === "lightning") {
    return (
      <dl className="mt-4 grid gap-2 rounded-[var(--radius-md)] bg-bg p-3 text-xs shadow-[inset_0_0_0_1px_var(--color-border)]">
        <Fact k="payment_hash" v={receipt.paymentHash ?? ""} />
        <Fact k="preimage" v={receipt.preimage ?? ""} />
        <Fact k="facture" v={receipt.invoice ?? ""} />
      </dl>
    );
  }
  return (
    <dl className="mt-4 grid gap-2 rounded-[var(--radius-md)] bg-bg p-3 text-xs shadow-[inset_0_0_0_1px_var(--color-border)]">
      <Fact k="input_hash" v={receipt.inputHash ?? ""} />
      <Fact k="secret" v={receipt.sharedSecret ?? ""} />
      <Fact k="sortie P2TR" v={receipt.taprootOutput ?? ""} />
    </dl>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-subtle">{k}</dt>
      <dd className="break-all font-mono text-fg">{v}</dd>
    </div>
  );
}

function ReceiverPanel({
  phase,
  current,
  receipts,
}: {
  phase: Phase;
  current: Receipt | null;
  receipts: Receipt[];
}) {
  const uri = buildUri();
  return (
    <article className="rounded-[var(--radius-xl)] bg-bg-elevated p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
            Destinataire · {RECIPIENT.name}
          </p>
          <h2 className="mt-1 font-display text-3xl text-fg">Recevoir</h2>
        </div>
        <Badge variant="live">
          <span className="size-1.5 rounded-full bg-success" />
          QR figé
        </Badge>
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <QrMark payload={uri} className="w-36 shrink-0" />
        <div className="min-w-0 text-center sm:text-left">
          <p className="font-mono text-sm text-fg">₿{RECIPIENT.display}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Ce QR ne change jamais. Chaque paiement atterrit sur une facture ou une
            sortie Taproot neuve, invisible depuis l’identifiant.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge variant="quiet">
              <CloudLightning className="size-3" />
              Offre lno
            </Badge>
            <Badge variant="quiet">
              <Shield className="size-3" />
              Scan sp1q
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-md)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)]">
        {phase === "settled" && current ? (
          <Incoming receipt={current} />
        ) : phase === "paying" ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle className="size-4 animate-spin" />
            Écoute du rail choisi…
          </p>
        ) : (
          <p className="text-sm text-muted">
            En attente. Le QR reste le même — c’est tout l’intérêt.
          </p>
        )}
      </div>

      {receipts.length >= 2 && (
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {receipts.length} paiements reçus, {new Set(receipts.map(outputOf)).size} destinations
          distinctes. Aucune n’est l’adresse sp1q.
        </p>
      )}
    </article>
  );
}

function Incoming({ receipt }: { receipt: Receipt }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-success">
        <ArrowDown className="size-3.5" />
        Reçu
      </p>
      <p className="mt-1 font-display text-3xl tabular-nums text-fg">
        {formatSats(receipt.amountSats)}
        <span className="ml-1 text-lg text-muted">sats</span>
      </p>
      <p className="mt-2 text-sm text-muted">
        {receipt.rail === "lightning"
          ? "Lightning · facture unique, offre inchangée"
          : "On-chain · sortie Taproot unique, sp1q invisible"}
      </p>
      <p className="mt-3 break-all font-mono text-[11px] text-subtle">
        {receipt.rail === "lightning" ? receipt.paymentHash : receipt.taprootOutput}
      </p>
    </div>
  );
}

function History({ receipts }: { receipts: Receipt[] }) {
  return (
    <article className="rounded-[var(--radius-xl)] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-border)] sm:p-5">
      <h3 className="text-sm font-medium text-fg">Registre d’unlinkabilité</h3>
      <p className="mt-1 text-xs text-muted">
        Même destinataire, aucune adresse en commun. Un observateur on-chain ne peut pas les
        relier à ₿{RECIPIENT.display}.
      </p>
      <ul className="mt-4 divide-y divide-border">
        {receipts.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm text-fg">
                {r.rail === "lightning" ? "Lightning" : "Silent"}
                <span className="ml-2 text-xs text-subtle">k={r.k}</span>
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted">{outputOf(r)}</p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-fg">{formatSats(r.amountSats)}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function outputOf(r: Receipt) {
  return r.rail === "lightning" ? (r.paymentHash ?? r.id) : (r.taprootOutput ?? r.id);
}
