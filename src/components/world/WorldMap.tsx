import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Agent } from "@/lib/api/agents";
import { capsWidth } from "@/lib/caps";
import { prefersReducedMotion } from "@/components/pixel/ring";
import { seats, type Layout, type Tile } from "./world-art";
import { GARDEN, GARDEN_W, GARDEN_H, surfaceFit } from "./garden";

/** Interactive world map: the painted garden image with an SVG overlay aligned to its
 *  surface diamond for hit-testing, hover, selection outline and the floating nameplate.
 *  Resting $TICKER labels are baked into the artwork, so only the selection gets a plate. */

export type MapSelection = { kind: "agent"; id: string } | { kind: "region"; id: string } | null;

export function regionLabel(t: Pick<Tile, "id" | "kind" | "deposit" | "improvement" | "trait">) {
  return [t.id, t.kind, t.deposit && "materials", t.improvement, t.trait].filter(Boolean).join(" · ");
}

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Contain-fit rect for the artwork inside the stage, with breathing room around the island. */
function useStageRect(ref: RefObject<HTMLDivElement | null>) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const s = Math.min((w * 0.9) / GARDEN_W, (h * 0.9) / GARDEN_H);
      const width = GARDEN_W * s, height = GARDEN_H * s;
      setRect({ left: (w - width) / 2, top: (h - height) / 2, width, height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return rect;
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
  const rect = useStageRect(wrap);
  const fit = useMemo(() => surfaceFit(map), [map]);
  const focused = selected?.kind === "agent" ? selected.id : null;
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 240);
    return () => clearTimeout(t);
  }, [flash]);
  const flashAt = (id: string) => { if (!prefersReducedMotion()) setFlash(id); };

  const at = useMemo(() => seats(agents, map), [agents, map]);
  const byId = new Map(agents.map((a) => [a.id, a]));

  // Surface top vertex of a tile, with raised centre tiles flattened back onto the plain.
  const surf = (t: Tile): [number, number] => [t.x, t.y + t.level * 3];
  const poly = (t: Tile) => {
    const [x, y] = surf(t);
    return [fit.to(x, y), fit.to(x + 8, y + 4), fit.to(x, y + 8), fit.to(x - 8, y + 4)]
      .map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`)
      .join(" ");
  };

  const selectedAgent = focused ? byId.get(focused) : undefined;
  const seatTile = focused ? at.get(focused) : undefined;
  const plate = useMemo(() => {
    if (!selectedAgent || !seatTile) return null;
    const [x, y] = surf(seatTile);
    const [px, py] = fit.to(x, y);
    const w = capsWidth(selectedAgent.name, 24) + 24;
    return { x: px - w / 2, y: py - 130, w, textX: px, textY: py - 130 + 31 };
  }, [selectedAgent, seatTile, fit]);

  const pick = (t: Tile) => {
    flashAt(t.id);
    onSelect(t.owner ? { kind: "agent", id: t.owner } : { kind: "region", id: t.id });
  };

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden">
      {rect && (
        <div className="absolute" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          <img
            src={GARDEN.url}
            width={GARDEN_W}
            height={GARDEN_H}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full select-none"
          />
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${GARDEN_W} ${GARDEN_H}`}
            className="absolute inset-0"
            shapeRendering="geometricPrecision"
            role="img"
            aria-label="World map: every region, its owner, capitals, units and improvements"
            onClick={() => onSelect(null)}
          >
            <rect width={GARDEN_W} height={GARDEN_H} fill="transparent" />
            {map.tiles.map((t) => (
              <polygon
                key={t.id}
                data-region={t.id}
                points={poly(t)}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
                onClick={(event) => { event.stopPropagation(); pick(t); }}
              >
                <title>{`${regionLabel(t)}${t.owner ? ` · $${byId.get(t.owner)?.ticker ?? ""}` : ""}`}</title>
              </polygon>
            ))}

            {[...at].map(([id, t]) => {
              const a = byId.get(id)!;
              const [x, y] = surf(t);
              const [x1, y1] = fit.to(x - 7, y);
              const [x2, y2] = fit.to(x + 7, y + 8);
              const isSel = focused === id;
              const choose = () => { flashAt(t.id); onSelect({ kind: "agent", id }); };
              return (
                <g
                  key={id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${a.name}`}
                  aria-pressed={isSel}
                  data-agent-id={id}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => { event.stopPropagation(); choose(); }}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } }}
                  onMouseEnter={() => setHover(t.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect x={x1} y={y1 - 130} width={x2 - x1} height={y2 - y1 + 130} fill="transparent" />
                </g>
              );
            })}

            {hover && map.byId.get(hover) && (
              <polygon points={poly(map.byId.get(hover)!)} fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} pointerEvents="none" />
            )}
            {flash && map.byId.get(flash) && (
              <polygon points={poly(map.byId.get(flash)!)} fill="#ffffff" fillOpacity={0.65} pointerEvents="none" />
            )}
            {aimIds.map((id) => at.get(id)).filter(Boolean).map((t) => (
              <polygon key={t!.id} points={poly(t!)} fill="none" stroke="#2ce8f5" strokeWidth={3} pointerEvents="none" />
            ))}
            {seatTile && (
              <polygon points={poly(seatTile)} fill="none" stroke="var(--text)" strokeWidth={4} strokeLinejoin="round" pointerEvents="none">
                <animate attributeName="stroke-opacity" values="1;0.45;1" dur="1.6s" repeatCount="indefinite" />
              </polygon>
            )}
            {selectedAgent && plate && (
              <g data-selected-nameplate={selectedAgent.id} pointerEvents="none">
                <rect x={plate.x} y={plate.y} width={plate.w} height={44} fill="var(--bg0)" stroke="var(--text)" strokeWidth={2} />
                <text x={plate.textX} y={plate.textY} textAnchor="middle" className="font-caps" fontSize={24} fill="var(--text)">{selectedAgent.name}</text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
