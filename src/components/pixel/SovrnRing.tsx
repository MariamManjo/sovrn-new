import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IDLE_FRAMES, ringPixels, type IdleFrame, type Px } from "./ring";

export const RING_TONES = {
  stone: { rest: "#8b9c98", pulse: "#dee6e2", settle: "#6a7b77", cap: "#dee6e2" },
  pol: { rest: "#0099db", pulse: "#2ce8f5", settle: "#124e89", cap: "#2ce8f5" },
  live: { rest: "#3e8948", pulse: "#63c74d", settle: "#265c42", cap: "#63c74d" },
  low: { rest: "#b69a59", pulse: "#feae34", settle: "#88644a", cap: "#feae34" },
  ruin: { rest: "#666469", pulse: "#666469", settle: "#666469", cap: "#9b9595" },
} as const;

export type RingTone = keyof typeof RING_TONES;

function runs(px: Px[]) {
  const rows = new Map<number, number[]>();
  for (const [x, y] of px) rows.set(y, [...(rows.get(y) ?? []), x]);
  const out: [number, number, number][] = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; ) {
      let w = 1;
      while (xs[i + w] === xs[i]! + w) w++;
      out.push([xs[i]!, y, w]);
      i += w;
    }
  }
  return out;
}

/** The logo ring at integer scale; children sit centred inside. Ruin tone stays still. */
export function SovrnRing({
  box,
  r,
  dashes = 16,
  scale = 1,
  tone = "stone",
  className,
  children,
}: {
  box: number;
  r: number;
  dashes?: number;
  scale?: number;
  tone?: RingTone;
  className?: string;
  children?: ReactNode;
}) {
  const frames = useMemo(
    () => IDLE_FRAMES.map((f) => ({ f, ...ringPixels(box / 2, box / 2, r, dashes, f) })),
    [box, r, dashes],
  );
  const colors = RING_TONES[tone];
  const still = tone === "ruin";
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: box * scale, height: box * scale }}>
      <svg width={box * scale} height={box * scale} viewBox={`0 0 ${box} ${box}`} shapeRendering="crispEdges" className="absolute inset-0" aria-hidden>
        {frames.map(({ f, body, caps }) =>
          still && f !== "rest" ? null : (
            <g key={f} className={still ? undefined : `idle-${f as IdleFrame}`}>
              {runs(body).map(([x, y, w]) => <rect key={`b${x}-${y}`} x={x} y={y} width={w} height={1} fill={colors[f]} />)}
              {runs(caps).map(([x, y, w]) => <rect key={`c${x}-${y}`} x={x} y={y} width={w} height={1} fill={colors.cap} />)}
            </g>
          ),
        )}
      </svg>
      {children && <span className="relative">{children}</span>}
    </span>
  );
}
