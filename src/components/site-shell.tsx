import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/spotlight";

const LINKS = [
  { to: "/", label: "Recevoir" },
  { to: "/lab", label: "Payer" },
  { to: "/stack", label: "Architecture" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="bg-blackhole" aria-hidden="true" />
      <Spotlight />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/70 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
            <Link to="/" className="flex items-center gap-2.5 text-fg">
              <span className="grid size-7 place-items-center rounded-[var(--radius-xs)] bg-electric text-[#0b0c0d]">
                <Mark />
              </span>
              <span className="font-display text-xl leading-none tracking-tight">
                Umbra
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              {LINKS.map((link) => {
                const active = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors duration-[var(--motion-quick)] sm:px-3",
                      active ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>Umbra — identifiant Bitcoin unifié. BIP-352 × BOLT 12 × BIP-353 × BIP-321.</p>
            <p>Simulation locale. Aucune chaîne réelle, aucune clé privée.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <path
        d="M9 1 4 9h3l-1 6 5.5-8.5H8L9 1Z"
        fill="currentColor"
      />
    </svg>
  );
}
