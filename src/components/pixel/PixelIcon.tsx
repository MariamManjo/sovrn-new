import { cn } from "@/lib/utils";

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

/** 3x5 pixel digits for step and turn numbers. */
const DIGITS: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", "###", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", "..#", "..#", "..#"],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
};

export function PixelNumber({
  value,
  scale = 4,
  color = "var(--gold)",
}: {
  value: string;
  scale?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
}) {
  const chars = [...value];
  const w = chars.length * 4 - 1;
  return (
    <svg
      width={w * scale}
      height={5 * scale}
      viewBox={`0 0 ${w} 5`}
      className="pixelated"
      role="img"
      aria-label={value}
    >
      {chars.flatMap((ch, i) =>
        (DIGITS[ch] ?? []).flatMap((row, y) =>
          [...row].map((c, x) =>
            c === "#" ? (
              <rect key={`${i}-${x}-${y}`} x={i * 4 + x} y={y} width={1} height={1} fill={color} />
            ) : null,
          ),
        ),
      )}
    </svg>
  );
}

export function LiveDot({ tone = "live" }: { tone?: "live" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-block size-2 pixel-blink",
        tone === "live" ? "bg-alive" : "bg-alert",
      )}
      aria-hidden
    />
  );
}
