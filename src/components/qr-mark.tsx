import { cn } from "@/lib/utils";

const SIZE = 25;

function fnv(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function finderValue(x: number, y: number): boolean | null {
  const inPattern = (ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
    const onBorder = dx === 0 || dy === 0 || dx === 6 || dy === 6;
    const inCore = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return onBorder || inCore;
  };
  return inPattern(0, 0) ?? inPattern(SIZE - 7, 0) ?? inPattern(0, SIZE - 7);
}

function isTiming(x: number, y: number) {
  if (finderValue(x, y) !== null) return false;
  return x === 6 || y === 6;
}

function modulesFor(payload: string) {
  const seed = fnv(payload);
  const cells: boolean[][] = [];
  for (let y = 0; y < SIZE; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < SIZE; x++) {
      const finder = finderValue(x, y);
      if (finder !== null) {
        row.push(finder);
        continue;
      }
      if (isTiming(x, y)) {
        row.push((x + y) % 2 === 0);
        continue;
      }
      const n = fnv(`${seed}:${x}:${y}:${payload.length}`);
      row.push((n & 3) !== 0);
    }
    cells.push(row);
  }
  return cells;
}

export function QrMark({
  payload,
  className,
  label,
}: {
  payload: string;
  className?: string;
  label?: string;
}) {
  const cells = modulesFor(payload);
  return (
    <div
      className={cn(
        "relative aspect-square rounded-[var(--radius-md)] bg-fg p-3",
        className,
      )}
      role="img"
      aria-label={label ?? "QR unifié"}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full" shapeRendering="crispEdges">
        {cells.map((row, y) =>
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
