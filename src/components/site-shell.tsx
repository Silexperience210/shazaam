import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Système" },
  { to: "/lab", label: "Laboratoire" },
  { to: "/stack", label: "Architecture" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg">
            <span className="grid size-7 place-items-center rounded-[var(--radius-xs)] bg-accent text-accent-fg">
              <Mark />
            </span>
            <span className="font-display text-xl leading-none tracking-tight">Umbra</span>
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
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <path
        d="M8 1.2 3.2 4.1v7.8L8 14.8l4.8-2.9V4.1L8 1.2Zm0 1.7 3.2 1.9v.9L8 4.8 4.8 5.7v-.9L8 2.9Zm-3.2 3.3 3.2 1.9 3.2-1.9v1.15L8 9.25 4.8 7.35V6.2Zm0 2.4 3.2 1.9 3.2-1.9v1.2L8 11.7 4.8 9.8V8.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
