import { useEffect, useMemo, useRef, useState } from "react";
import type { Agent } from "@/lib/api/agents";
import { capsWidth } from "@/lib/caps";
import { prefersReducedMotion } from "@/components/pixel/ring";
import { H, N, W, anchors, seatAgents, tileTop } from "./world-art";
import { useIdleFrame, useWorldCanvas, useWorldScale } from "./use-world";

/** Interactive world map: native pixel canvas at whole-number scale, SVG overlay for hits and labels. */

export type MapSelection = { kind: "agent"; id: string } | { kind: "frontier" } | null;

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function SeasonMap({
  agents,
  selected,
  onSelect,
  aimIds = [],
}: {
  agents: Agent[];
  selected: MapSelection;
  onSelect: (s: MapSelection) => void;
  aimIds?: string[];
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const { s, w, h, ox, oy } = useWorldScale(wrap, "fit");
  const frame = useIdleFrame();
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ i: number; j: number; time: number; step: number } | null>(null);
  const focused = selected?.kind === "agent" ? selected.id : null;

  useEffect(() => {
    if (!flash || flash.step > 1) return;
    const t = setTimeout(() => setFlash((f) => f && f.time === flash.time ? { ...f, step: f.step + 1 } : f), 110);
    return () => clearTimeout(t);
  }, [flash]);
  const flashAt = (i: number, j: number) => { if (!prefersReducedMotion()) setFlash({ i, j, time: Date.now(), step: 0 }); };

  const hoverTile = useMemo(() => hover ? hover.split("-").map(Number) as [number, number] : null, [hover]);
  const canvas = useWorldCanvas({ agents, focused, frame, hover: hoverTile, aim: aimIds, flash });

  const seats = useMemo(() => seatAgents(agents), [agents]);
  const seated = agents.filter((a) => seats.has(a.id));
  const at = anchors(agents, seats);
  const showLabels = s >= 2;

  const labels = seated.map((a) => {
    const p = at[a.id]!;
    const text = `$${a.ticker}`;
    const tw = capsWidth(text);
    const x = p.x * s - Math.floor(tw / 2);
    const y = p.base * s + 2;
    return { a, text, x, y, plate: { x: x - 3, y, w: tw + 6, h: 13 } };
  });

  const selectedAgent = seated.find((a) => a.id === focused);
  let plate: (Rect & { tx: number }) | null = null;
  if (selectedAgent) {
    const p = at[selectedAgent.id]!;
    const tw = capsWidth(selectedAgent.name);
    plate = { x: p.x * s - Math.floor(tw / 2) - 4, y: Math.round((p.top + p.y) / 2 - 16) * s - 17, w: tw + 8, h: 17, tx: p.x * s - Math.floor(tw / 2) };
    // Move the selected plate above any nearby resting label, never hide it.
    while (showLabels && labels.some((l) => l.a.id !== focused && overlaps(l.plate, plate!))) plate.y -= 15;
  }

  const tiles: { i: number; j: number }[] = [];
  for (let d = 0; d < 2 * N - 1; d++)
    for (let i = 0; i < N; i++) if (d - i >= 0 && d - i < N) tiles.push({ i, j: d - i });
  const occupied = new Set([...seats.values()].map(({ i, j }) => `${i}-${j}`));
  const pick = (a: Agent) => { const seat = seats.get(a.id)!; flashAt(seat.i, seat.j); onSelect({ kind: "agent", id: a.id }); };

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden">
      <canvas ref={canvas} width={W} height={H} className="pixelated absolute" style={{ left: ox, top: oy, width: W * s, height: H * s }} aria-hidden />
      <svg
        width={w}
        height={h}
        className="absolute inset-0"
        shapeRendering="crispEdges"
        role="img"
        aria-label="World map — isometric grid with agent settlements"
        onClick={() => onSelect(null)}
      >
        <rect width={w} height={h} fill="transparent" />
        <g transform={`translate(${ox} ${oy})`}>
          {tiles.map(({ i, j }) => {
            const [x, y] = tileTop(i, j);
            const key = `${i}-${j}`;
            return (
              <polygon
                key={key}
                points={`${x * s},${y * s} ${(x + 8) * s},${(y + 4) * s} ${x * s},${(y + 8) * s} ${(x - 8) * s},${(y + 4) * s}`}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(key)}
                onMouseLeave={() => setHover(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  flashAt(i, j);
                  if (occupied.has(key)) return; // settlement's own handler fires
                  onSelect({ kind: "frontier" });
                }}
              />
            );
          })}

          {seated.map((a) => {
            const p = at[a.id]!;
            const seat = seats.get(a.id)!;
            const isSel = focused === a.id;
            return (
              <g
                key={a.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${a.name}`}
                aria-pressed={isSel}
                data-agent-id={a.id}
                className="season-settlement"
                style={{ cursor: "pointer" }}
                onClick={(event) => { event.stopPropagation(); pick(a); }}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pick(a); } }}
                onMouseEnter={() => setHover(`${seat.i}-${seat.j}`)}
                onMouseLeave={() => setHover(null)}
              >
                <rect x={(p.x - 7) * s} y={(p.top - 1) * s} width={14 * s} height={(p.base - p.top + 1) * s} fill="transparent" />
              </g>
            );
          })}

          {/* SVG paint order is the label z-index: all labels sit above all artwork. */}
          {showLabels && (
            <g pointerEvents="none" aria-label="Settlement tickers">
              {labels.map(({ a, text, x, y, plate: r }) => (
                <g key={a.id}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--bg0)" />
                  <text data-settlement-label={a.id} x={x} y={y + 11} className="font-caps" fontSize={12} fill={focused && focused !== a.id ? "var(--text-mute)" : "var(--text)"}>{text}</text>
                </g>
              ))}
            </g>
          )}
          {selectedAgent && plate && (
            <g key={selectedAgent.id} data-selected-nameplate={selectedAgent.id} pointerEvents="none">
              <rect x={plate.x} y={plate.y} width={plate.w} height={plate.h} fill="var(--bg0)" stroke="var(--text)" />
              <text x={plate.tx} y={plate.y + 13} className="font-caps" fontSize={12} fill="var(--text)">{selectedAgent.name}</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
