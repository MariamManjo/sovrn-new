import { cn } from "@/lib/utils";
import { SovrnRing } from "./SovrnRing";

/**
 * Crisp pixel sprites drawn as SVG rects on an integer grid.
 * '#' = primary (lime), '+' = dim gray, 'x' = danger red, '.' = empty.
 */
const SPRITES = {
  rocket: [
    "...##...",
    "..####..",
    "..#++#..",
    "..####..",
    ".######.",
    "#.####.#",
    "..#..#..",
    ".x....x.",
  ],
  brain: [
    "..####..",
    ".#+##+#.",
    "#+#++#+#",
    "#######.",
    "#+#++#+#",
    ".######.",
    "...##...",
    "...##...",
  ],
  flag: [
    "#.......",
    "#####...",
    "#######.",
    "#####...",
    "#.......",
    "#.......",
    "#.......",
    "###.....",
  ],
  pool: [
    "...##...",
    "..#..#..",
    ".#....#.",
    "#..##..#",
    "#.####.#",
    "########",
    ".######.",
    "..++++..",
  ],
  agent: [
    ".######.",
    "#++++++#",
    "#+#++#+#",
    "#++++++#",
    ".######.",
    "..#..#..",
    ".######.",
    "#.#..#.#",
  ],
  ruin: [
    "........",
    "#...x...",
    "#..xx.#.",
    "##.x..#.",
    "##+..##.",
    "###+.###",
    "+#####++",
    "++++++++",
  ],
  coin: [
    "..####..",
    ".#++++#.",
    "#++##++#",
    "#+#++++#",
    "#++##++#",
    "#++++#+#",
    ".#++++#.",
    "..####..",
  ],
} as const;

export type PixelSprite = keyof typeof SPRITES;

const FILL: Record<string, string> = {
  "#": "var(--alive)",
  "+": "var(--pixel-dim)",
  x: "var(--destructive)",
};

export function PixelIcon({
  name,
  scale = 3,
  color,
  className,
}: {
  /** CSS color for '#' pixels (defaults to primary) */
  color?: string;
  name: PixelSprite;
  /** integer pixel scale — keeps the grid crisp */
  scale?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const rows = SPRITES[name];
  const size = rows[0].length;
  return (
    <svg
      width={size * scale}
      height={rows.length * scale}
      viewBox={`0 0 ${size} ${rows.length}`}
      className={cn("pixelated shrink-0", className)}
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          FILL[c] ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c === "#" && color ? color : FILL[c]} />
          ) : null,
        ),
      )}
    </svg>
  );
}

/** Live indicator: the logo ring at its smallest, no dashes. */
export function LiveDot({ tone = "live" }: { tone?: "live" | "danger" }) {
  return <SovrnRing box={12} r={2.5} dashes={0} tone={tone === "live" ? "live" : "low"} />;
}
