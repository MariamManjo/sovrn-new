import { useEffect, useMemo, useRef, useState } from "react";
import type { Agent } from "@/lib/api/agents";
import { capsWidth } from "@/lib/caps";
import { prefersReducedMotion } from "@/components/pixel/ring";
import { anchors, seats, type Layout, type Tile } from "./world-art";
import { useIdleFrame, useWorldCanvas, useWorldScale } from "./use-world";

/** Interactive world map: live pixel canvas (generated each frame) + SVG hit layer.
 *  Clicks map 1:1 onto painted tiles — no static garden PNG. */

export type MapSelection = { kind: "agent"; id: string } | { kind: "region"; id: string } | null;

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function regionLabel(t: Pick<Tile, "id" | "kind" | "deposit" | "improvement" | "trait">) {
  return [t.id, t.kind, t.deposit && "materials", t.improvement, t.trait].filter(Boolean).join(" · ");
}

export function WorldMap({
  agents,
  map,
  selected,
  onSelect,
  aimIds = [],
}: {
  agents: Agent[];
  map: Layout;
  selected: MapSelection;
  onSelect: (s: MapSelection) => void;
  aimIds?: string[];
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const { s, w, h, ox, oy } = useWorldScale(wrap, "fit", map.w, map.h, 0.98);
  const frame = useIdleFrame();
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ id: string; time: number; step: number } | null>(null);
  const focused = selected?.kind === "agent" ? selected.id : null;

  useEffect(() => {
    if (!flash || flash.step > 1) return;
    const t = setTimeout(() => setFlash((f) => (f && f.time === flash.time ? { ...f, step: f.step + 1 } : f)), 110);
    return () => clearTimeout(t);
  }, [flash]);
  const flashAt = (id: string) => {
    if (!prefersReducedMotion()) setFlash({ id, time: Date.now(), step: 0 });
  };

  const canvas = useWorldCanvas({ agents, map, focused, frame, hover, aim: aimIds, flash });
  const at = useMemo(() => seats(agents, map), [agents, map]);
  const anchor = anchors(agents, map, at);
  const byId = new Map(agents.map((a) => [a.id, a]));
  const showLabels = s >= 2;

  // Biggest empires claim label space first; a label that would overlap is dropped, never stacked.
  const placed: Rect[] = [];
  const labels = [...at.keys()]
    .map((id) => byId.get(id)!)
    .sort((a, b) => Number(b.id === focused) - Number(a.id === focused) || b.influence - a.influence)
    .flatMap((a) => {
      const p = anchor[a.id]!;
      const text = `$${a.ticker}`;
      const tw = capsWidth(text);
      const x = p.x * s - Math.floor(tw / 2);
      const y = p.base * s + 2;
      const plate = { x: x - 3, y, w: tw + 6, h: 13 };
      if (placed.some((r) => overlaps(r, plate))) return [];
      placed.push(plate);
      return [{ a, text, x, y, plate }];
    });

  const selectedAgent = focused ? byId.get(focused) : undefined;
  let plate: (Rect & { tx: number }) | null = null;
  if (selectedAgent && anchor[selectedAgent.id]) {
    const p = anchor[selectedAgent.id]!;
    const tw = capsWidth(selectedAgent.name);
    plate = {
      x: p.x * s - Math.floor(tw / 2) - 4,
      y: Math.round((p.top + p.y) / 2 - 16) * s - 17,
      w: tw + 8,
      h: 17,
      tx: p.x * s - Math.floor(tw / 2),
    };
    while (showLabels && labels.some((l) => l.a.id !== focused && overlaps(l.plate, plate!))) plate.y -= 15;
  }

  const pick = (t: Tile) => {
    flashAt(t.id);
    onSelect(t.owner ? { kind: "agent", id: t.owner } : { kind: "region", id: t.id });
  };

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvas}
        width={map.w}
        height={map.h}
        className="pixelated absolute"
        style={{ left: ox, top: oy, width: map.w * s, height: map.h * s }}
        aria-hidden
      />
      <svg
        width={w}
        height={h}
        className="absolute inset-0"
        shapeRendering="crispEdges"
        role="img"
        aria-label="World map: every region, its owner, capitals, units and improvements"
        onClick={() => onSelect(null)}
      >
        <rect width={w} height={h} fill="transparent" />
        <g transform={`translate(${ox} ${oy})`}>
          {map.tiles.map((t) => {
            const owner = t.owner ? byId.get(t.owner) : undefined;
            return (
              <polygon
                key={t.id}
                data-region={t.id}
                points={`${t.x * s},${t.y * s} ${(t.x + 8) * s},${(t.y + 4) * s} ${t.x * s},${(t.y + 8) * s} ${(t.x - 8) * s},${(t.y + 4) * s}`}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  pick(t);
                }}
              >
                <title>{`${regionLabel(t)}${owner ? ` · $${owner.ticker}` : ""}`}</title>
              </polygon>
            );
          })}

          {[...at].map(([id, t]) => {
            const a = byId.get(id)!;
            const p = anchor[id]!;
            const isSel = focused === id;
            const choose = () => {
              flashAt(t.id);
              onSelect({ kind: "agent", id });
            };
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${a.name}`}
                aria-pressed={isSel}
                data-agent-id={id}
                className="world-settlement"
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  event.stopPropagation();
                  choose();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose();
                  }
                }}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
              >
                <rect x={(p.x - 7) * s} y={(p.top - 1) * s} width={14 * s} height={(p.base - p.top + 1) * s} fill="transparent" />
              </g>
            );
          })}

          {showLabels && (
            <g pointerEvents="none" aria-label="Empire tickers">
              {labels.map(({ a, text, x, y, plate: r }) => (
                <g key={a.id}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="var(--bg0)" />
                  <text
                    data-settlement-label={a.id}
                    x={x}
                    y={y + 11}
                    className="font-caps"
                    fontSize={12}
                    fill={focused && focused !== a.id ? "var(--text-mute)" : "var(--text)"}
                  >
                    {text}
                  </text>
                </g>
              ))}
            </g>
          )}
          {selectedAgent && plate && (
            <g key={selectedAgent.id} data-selected-nameplate={selectedAgent.id} pointerEvents="none">
              <rect x={plate.x} y={plate.y} width={plate.w} height={plate.h} fill="var(--bg0)" stroke="var(--text)" />
              <text x={plate.tx} y={plate.y + 13} className="font-caps" fontSize={12} fill="var(--text)">
                {selectedAgent.name}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
