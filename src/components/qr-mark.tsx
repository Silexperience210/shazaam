import { useMemo } from "react";
import { encode } from "uqr";
import { cn } from "@/lib/utils";

type Ecc = "L" | "M" | "Q" | "H";

const QUIET_ZONE = 4; // modules — requis par la spec QR pour un scan fiable

/**
 * Encode `payload` en un vrai QR scannable (uqr, zéro dépendance).
 * Retourne null si le contenu dépasse la capacité même en ECC minimal.
 */
function encodeReal(payload: string, ecc: Ecc): { size: number; cells: boolean[][] } | null {
  // Essaie le niveau demandé, puis descend en ECC si le contenu est trop long.
  for (const level of [ecc, "M", "L"] as const) {
    try {
      const qr = encode(payload, { ecc: level, border: QUIET_ZONE });
      return { size: qr.size, cells: qr.data };
    } catch {
      /* payload trop long pour ce niveau — on tente le suivant */
    }
  }
  return null;
}

/**
 * Construit le `d` d'un unique <path> pour toutes les cellules allumées.
 *
 * Deux raisons (review Claude, bug « no QR » Phoenix) :
 * 1. Un seul nœud DOM au lieu de ~11 000 <rect> — plus de jointures, plus de
 *    dérive de snapping aux pixels physiques.
 * 2. Plus de `shapeRendering="crispEdges"` : à une échelle non-entière
 *    (ex. 149 modules dans 136 px = facteur 0,913), l'antialiasing par défaut
 *    évite que des modules 1×1 disparaissent — les patterns de timing et
 *    d'alignement restent intacts avant le passage de la caméra.
 */
function modulesPath(cells: boolean[][]): string {
  let d = "";
  for (let y = 0; y < cells.length; y++) {
    const row = cells[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

export function QrMark({
  payload,
  className,
  label,
  ecc = "M",
}: {
  payload: string;
  className?: string;
  label?: string;
  ecc?: Ecc;
}) {
  const qr = useMemo(() => encodeReal(payload, ecc), [payload, ecc]);

  if (!qr) {
    return (
      <div
        className={cn(
          "relative aspect-square rounded-[var(--radius-md)] bg-fg p-3",
          className,
        )}
        role="img"
        aria-label="QR illisible — contenu trop long"
      >
        <div className="grid size-full place-items-center text-center font-mono text-[9px] leading-tight text-accent-fg">
          contenu trop long
          <br />
          pour un QR
        </div>
      </div>
    );
  }

  const d = useMemo(() => modulesPath(qr.cells), [qr]);

  return (
    <div
      className={cn(
        "relative aspect-square rounded-[var(--radius-md)] bg-fg p-3",
        className,
      )}
      role="img"
      aria-label={label ?? "QR unifié"}
    >
      <svg
        viewBox={`0 0 ${qr.size} ${qr.size}`}
        className="size-full"
        aria-hidden="true"
      >
        <path d={d} fill="currentColor" className="text-accent-fg" />
      </svg>
    </div>
  );
}
