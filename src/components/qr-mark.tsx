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
  const qr = encodeReal(payload, ecc);

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
        shapeRendering="crispEdges"
      >
        {qr.cells.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="currentColor"
                className="text-accent-fg"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
