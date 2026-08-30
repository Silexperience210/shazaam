import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { QrMark } from "@/components/qr-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildUri, RECIPIENT } from "@/lib/identity";
import { cn } from "@/lib/utils";

export function IdentityCard({ className }: { className?: string }) {
  const uri = buildUri();
  const [copied, setCopied] = useState<"handle" | "uri" | null>(null);

  async function copy(kind: "handle" | "uri", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      className={cn(
        "rounded-[var(--radius-xl)] bg-surface p-4 sm:p-5",
        "shadow-[inset_0_0_0_1px_var(--color-border)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Recevoir</p>
          <h2 className="mt-1 font-display text-3xl leading-none text-fg sm:text-4xl">
            {RECIPIENT.name}
          </h2>
        </div>
        <Badge variant="live">
          <span className="size-1.5 rounded-full bg-success" />
          Statique
        </Badge>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:items-start">
        <QrMark payload={uri} className="mx-auto w-40 sm:w-full" label="QR BIP-321 unifié" />
        <div className="min-w-0">
          <p className="font-mono text-sm text-fg sm:text-base">₿{RECIPIENT.display}</p>
          <p className="mt-1 text-sm text-muted">
            Un nom. Deux rails. Des adresses toujours neuves.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => copy("handle", RECIPIENT.handle)}>
              {copied === "handle" ? <Check /> : <Copy />}
              Copier le nom
            </Button>
            <Button size="sm" variant="ghost" onClick={() => copy("uri", uri)}>
              {copied === "uri" ? <Check /> : <Copy />}
              URI
            </Button>
          </div>
          <dl className="mt-5 grid gap-3 text-xs">
            <Row k="Lightning" v="BOLT 12 · lno" />
            <Row k="On-chain" v="BIP-352 · sp1q" />
            <Row k="DNS" v={RECIPIENT.dnsHost} mono />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
      <dt className="text-subtle">{k}</dt>
      <dd className={cn("min-w-0 text-right text-fg", mono ? "break-all font-mono" : "truncate")}>{v}</dd>
    </div>
  );
}
