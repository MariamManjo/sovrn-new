import { useState } from "react";
import type { Agent } from "@/lib/mock/agents";

/**
 * Interactive isometric season map — pure SVG, no bitmaps.
 * Tiles hover-highlight; settlements and agent tokens are clickable.
 * Selection is lifted to the parent via onSelect.
 */

const N = 16;
const TW = 64;
const TH = 32;
const C = (N - 1) / 2;

const iso = (i: number, j: number) => ({ x: (i - j) * (TW / 2), y: (i + j) * (TH / 2) });
const rnd = (i: number, j: number, k = 0) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

type Kind = "core" | "water" | "plaza" | "cobble" | "grass" | "ash";

function tileKind(i: number, j: number): Kind {
  const d = Math.max(Math.abs(i - C), Math.abs(j - C));
  if (d < 1) return "core";
  if (d < 1.6) return "water";
  if (d < 2.6) return "plaza";
  if (i > N - 5 && j < 5) return "ash";
  if (d < 5) return "cobble";
  return "grass";
}

const TOP: Record<Kind, string[]> = {
  core: ["var(--pol-glow)"],
  water: ["var(--water-deep)", "var(--pol)"],
  plaza: ["var(--civ-earth)", "var(--civ-timber)"],
  cobble: ["var(--civ-earth)", "var(--civ-timber)", "var(--civ-earth)"],
  grass: ["var(--alive)", "var(--alive-deep)", "var(--alive-deep)"],
  ash: ["var(--text-mute)", "var(--map-slate)"],
};

const diamond = (x: number, y: number) =>
  `${x},${y} ${x + TW / 2},${y + TH / 2} ${x},${y + TH} ${x - TW / 2},${y + TH / 2}`;

/** Where each agent's settlement sits on the grid. */
export const SEATS: Record<string, { i: number; j: number }> = {
  vesper: { i: 6, j: 8 },
  nyx: { i: 11, j: 4 },
  helix: { i: 4, j: 10 },
  mira: { i: 9, j: 11 },
  orin: { i: 12, j: 8 },
  sable: { i: 5, j: 4 },
  kite: { i: 3, j: 12 },
  loom: { i: 10, j: 13 },
  rook: { i: 13, j: 6 },
  dusk: { i: 6, j: 12 },
  quill: { i: 13, j: 2 },
  ash: { i: 14, j: 4 },
};

function House({ x, y, h, roof }: { x: number; y: number; h: number; roof: string }) {
  const top = y - h;
  return (
    <g>
      <polygon
        points={`${x - TW / 2},${y + TH / 2 - h} ${x},${y + TH - h} ${x},${y + TH} ${x - TW / 2},${y + TH / 2}`}
        fill="var(--parchment)"
        stroke="var(--ink)"
        strokeWidth={2}
      />
      <polygon
        points={`${x},${y + TH - h} ${x + TW / 2},${y + TH / 2 - h} ${x + TW / 2},${y + TH / 2} ${x},${y + TH}`}
        fill="var(--civ-earth)"
        stroke="var(--ink)"
        strokeWidth={2}
      />
      <line x1={x - TW / 2} y1={y + TH / 2 - h / 2} x2={x} y2={y + TH - h / 2} stroke="var(--timber)" strokeWidth={3} />
      <line x1={x} y1={y + TH - h / 2} x2={x + TW / 2} y2={y + TH / 2 - h / 2} stroke="var(--timber)" strokeWidth={3} />
      <rect x={x - 20} y={y + TH / 2 - h + 10} width={6} height={6} fill="var(--lamp-gold)" className="lamp-flicker" />
      <rect x={x + 12} y={y + TH / 2 - h + 10} width={6} height={6} fill="var(--lamp-gold)" />
      <polygon points={`${x - TW / 2 - 4},${top + TH / 2} ${x},${top - 22} ${x},${top + TH + 2}`} fill={roof} stroke="var(--ink)" strokeWidth={2} />
      <polygon points={`${x},${top - 22} ${x + TW / 2 + 4},${top + TH / 2} ${x},${top + TH + 2}`} fill={roof} stroke="var(--ink)" strokeWidth={2} opacity={0.8} />
    </g>
  );
}

function Ruin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 14} y={y - 10} width={10} height={26} fill="var(--ash)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={x + 2} y={y + 2} width={10} height={14} fill="var(--border-c)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={x - 4} y={y - 18} width={4} height={4} fill="var(--roof-red)" className="pixel-blink" />
    </g>
  );
}

export type MapSelection = { kind: "agent"; id: string } | { kind: "frontier" } | null;

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
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ i: number; j: number; time: number } | null>(null);
  const focused = selected?.kind === "agent" ? selected.id : null;
  const focusSeat = focused ? SEATS[focused] : undefined;
  const focusPoint = focusSeat ? iso(focusSeat.i, focusSeat.j) : null;

  const tiles: { i: number; j: number; k: Kind }[] = [];
  for (let s = 0; s < 2 * N - 1; s++)
    for (let i = 0; i < N; i++) {
      const j = s - i;
      if (j >= 0 && j < N) tiles.push({ i, j, k: tileKind(i, j) });
    }

  const seated = agents.filter((a) => SEATS[a.id]);
  const selectedAgent = seated.find(a => a.id === focused);
  let nameplateY = focusPoint ? focusPoint.y - 100 : 0;
  // Move the selected plate above any nearby resting label, never hide it.
  while (focusPoint && seated.some(a => {
    const seat = SEATS[a.id];
    if (!seat || a.id === focused) return false;
    const point = iso(seat.i, seat.j);
    return Math.abs(point.x - focusPoint.x) < 82 && Math.abs(point.y + TH + 14 - (nameplateY + 15)) < 26;
  })) nameplateY -= 28;
  const core = iso(C, C);
  const minX = -N * (TW / 2) - 40;
  const width = N * TW + 80;

  return (
    <svg
      viewBox={`${minX} -120 ${width} ${N * TH + 200}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="World map — isometric grid with agent settlements"
      onClick={() => onSelect(null)}
    >
      <rect x={minX} y={-120} width={width} height={N * TH + 200} fill="transparent" />
      <g className="season-map-muted" opacity={focused ? 0.62 : 1}>
      {/* stars */}
      {Array.from({ length: 50 }, (_, n) => (
        <rect
          key={n}
          x={Math.round(minX + rnd(n, 1) * width)}
          y={Math.round(-120 + rnd(n, 2) * 140)}
          width={3}
          height={3}
          fill={n % 7 === 0 ? "var(--gold-light)" : "var(--text-dim)"}
          opacity={[0.3, 0.5, 0.7][n % 3]}
          className={n % 9 === 0 ? "pixel-blink" : undefined}
        />
      ))}

      {/* island skirt */}
      <polygon
        points={`${iso(0, N).x},${iso(0, N).y} ${iso(N, N).x},${iso(N, N).y} ${iso(N, 0).x},${iso(N, 0).y} ${iso(N, 0).x},${iso(N, 0).y + 40} ${iso(N, N).x},${iso(N, N).y + 40} ${iso(0, N).x},${iso(0, N).y + 40}`}
        fill="var(--civ-timber)"
        stroke="var(--ink)"
        strokeWidth={3}
      />

      {/* tiles — hover highlight + frontier click */}
      {tiles.map(({ i, j, k }) => {
        const { x, y } = iso(i, j);
        const pal = TOP[k];
        const fill = pal[(i * 7 + j * 13 + i * j) % pal.length];
        const key = `${i}-${j}`;
        const occupied = seated.some((a) => SEATS[a.id]?.i === i && SEATS[a.id]?.j === j);
        return (
          <polygon
            key={key}
            points={diamond(x, y)}
            fill={fill}
             stroke={hover === key ? "var(--text)" : "var(--ink)"}
            strokeOpacity={hover === key ? 0.9 : 0.55}
            strokeWidth={hover === key ? 2.5 : 1.5}
            className={k === "core" ? "core-glow" : undefined}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
            onClick={(event) => {
              event.stopPropagation();
              setFlash({ i, j, time: Date.now() });
              if (occupied) return; // settlement's own handler fires
              onSelect({ kind: "frontier" });
            }}
          />
        );
      })}

      {/* influence rings around POL core */}
      {[1, 2, 3].map((r) => (
        <ellipse
          key={r}
          cx={core.x}
          cy={core.y + TH / 2}
          rx={TW * r * 1.25}
          ry={TH * r * 1.25}
          fill="none"
          stroke={r === 1 ? "var(--pol-glow)" : r === 2 ? "var(--pol)" : "var(--influence)"}
          strokeWidth={3}
          strokeDasharray="8 6"
          className="ring-pulse"
          style={{ animationDelay: `${r * 0.4}s`, pointerEvents: "none" }}
        />
      ))}

      {/* POL core crystal */}
      <g className="core-glow" style={{ pointerEvents: "none" }}>
        <polygon
          points={`${core.x},${core.y - 40} ${core.x + 14},${core.y - 12} ${core.x},${core.y + 16} ${core.x - 14},${core.y - 12}`}
          fill="var(--pol-glow)"
          stroke="var(--ink)"
          strokeWidth={3}
        />
        <rect x={core.x - 4} y={core.y - 30} width={6} height={6} fill="var(--text)" />
      </g>
      </g>

      {aimIds.map(id => {
        const seat = SEATS[id];
        if (!seat) return null;
        const point = iso(seat.i, seat.j);
        return <polygon key={id} points={diamond(point.x, point.y)} fill="var(--text)" fillOpacity={0.16} stroke="var(--text-warm)" strokeWidth={2} className="selection-aim" pointerEvents="none" />;
      })}
      {focusPoint && <g key={focused} pointerEvents="none">
        {focusSeat && <polygon points={diamond(focusPoint.x, focusPoint.y)} fill={TOP[tileKind(focusSeat.i, focusSeat.j)][(focusSeat.i * 7 + focusSeat.j * 13 + focusSeat.i * focusSeat.j) % TOP[tileKind(focusSeat.i, focusSeat.j)].length]} />}
        <path d={`M ${core.x} ${core.y + TH / 2} L ${focusPoint.x} ${focusPoint.y + TH / 2}`} pathLength={1} className="selection-beam" fill="none" stroke="var(--text-warm)" strokeWidth={2} strokeDasharray="1" />
        <polygon points={diamond(focusPoint.x, focusPoint.y)} fill="none" stroke="var(--text)" strokeWidth={3} vectorEffect="non-scaling-stroke" className="selection-outline" />
      </g>}
      {flash && <polygon key={flash.time} points={diamond(iso(flash.i, flash.j).x, iso(flash.i, flash.j).y)} fill="var(--text)" className="selection-flash" pointerEvents="none" />}

      {/* settlements */}
      {seated.map((a, n) => {
        const seat = SEATS[a.id];
        if (!seat) return null;
        const { i, j } = seat;
        const { x, y } = iso(i, j);
        const ruin = a.status === "ruin";
        const isSel = selected?.kind === "agent" && selected.id === a.id;
        const roof = n % 2 === 0 ? "var(--roof-red)" : "var(--roof-blue)";
        return (
          <g
            key={a.id}
            role="button"
            tabIndex={0}
            aria-label={`Select ${a.name}`}
            aria-pressed={isSel}
            data-agent-id={a.id}
            opacity={focused && !isSel && !aimIds.includes(a.id) ? 0.6 : 1}
            className="season-settlement"
            style={{ cursor: "pointer" }}
            onClick={(event) => { event.stopPropagation(); setFlash({ i, j, time: Date.now() }); onSelect({ kind: "agent", id: a.id }); }}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFlash({ i, j, time: Date.now() }); onSelect({ kind: "agent", id: a.id }); } }}
            onMouseEnter={() => setHover(`${i}-${j}`)}
            onMouseLeave={() => setHover(null)}
          >
            {/* selection outline */}
            {isSel && (
              <polygon points={diamond(x, y)} fill="var(--text)" fillOpacity={0.1} stroke="var(--text-warm)" strokeWidth={2} pointerEvents="none" />
            )}
            {ruin ? <Ruin x={x} y={y} /> : <House x={x} y={y} h={30 + ((n * 7) % 12)} roof={roof} />}
            {/* agent token */}
            <g transform={isSel ? `translate(${x + 19} ${y + 6}) scale(1.25) translate(${-x - 19} ${-y - 6})` : undefined}>
            <g className="agent-idle" style={{ animationDelay: `${n * 0.3}s` }}>
              <rect x={x + 14} y={y + 6} width={10} height={12} fill={a.accentColor} stroke="var(--ink)" strokeWidth={2} />
              <rect x={x + 15} y={y - 2} width={8} height={8} fill="var(--parchment)" stroke="var(--ink)" strokeWidth={2} />
              <rect x={x + 17} y={y + 1} width={2} height={2} fill="var(--ink)" className="pixel-blink" style={{ animationDelay: `${n * 0.3}s` }} />
            </g>
            </g>
          </g>
        );
      })}
      {/* SVG paint order is the label z-index: all labels sit above all artwork. */}
      <g pointerEvents="none" aria-label="Settlement tickers">
        {seated.map(a => {
          const seat = SEATS[a.id];
          if (!seat) return null;
          const { x, y } = iso(seat.i, seat.j);
          return <text key={a.id} data-settlement-label={a.id} x={x} y={y + TH + 14} textAnchor="middle" fill="var(--text)" opacity={focused && focused !== a.id ? 0.8 : 1} stroke="var(--ink)" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round" fontSize={11} fontFamily="Silkscreen, monospace">${a.ticker}</text>;
        })}
      </g>
      {selectedAgent && focusPoint && <g key={selectedAgent.id} data-selected-nameplate={selectedAgent.id} className="selection-nameplate" pointerEvents="none">
        <rect x={focusPoint.x - 38} y={nameplateY} width={76} height={24} fill="var(--surface)" stroke="var(--text)" />
        <text x={focusPoint.x} y={nameplateY + 16} textAnchor="middle" fill="var(--text)" fontSize={12} fontFamily="Silkscreen, monospace">${selectedAgent.ticker}</text>
      </g>}
    </svg>
  );
}
