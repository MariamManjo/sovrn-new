/**
 * Procedural isometric season arena drawn entirely in SVG (no bitmaps).
 * Pure decoration — tile layout is a fixed deterministic pattern, not game state.
 */
const N = 16; // grid size
const TW = 64; // tile width
const TH = 32; // tile height
const C = (N - 1) / 2;

const iso = (i: number, j: number) => ({ x: (i - j) * (TW / 2), y: (i + j) * (TH / 2) });

// deterministic pseudo-random
const rnd = (i: number, j: number, k = 0) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

type Kind = "core" | "plaza" | "cobble" | "grass" | "ash";

function tileKind(i: number, j: number): Kind {
  const d = Math.max(Math.abs(i - C), Math.abs(j - C));
  if (d < 1) return "core";
  if (d < 2.6) return "plaza";
  // ruins corner (east)
  if (i > N - 5 && j < 5) return "ash";
  if (d < 5) return "cobble";
  return "grass";
}

const TOP: Record<Kind, string[]> = {
  core: ["var(--pol-teal)"],
  plaza: ["var(--stone-hi)", "var(--stone)"],
  cobble: ["var(--stone)", "oklch(0.33 0.03 300)"],
  grass: ["var(--grass)", "oklch(0.62 0.16 140)", "oklch(0.56 0.14 145)"],
  ash: ["var(--ash)", "oklch(0.5 0.01 270)"],
};

function diamond(x: number, y: number) {
  return `${x},${y} ${x + TW / 2},${y + TH / 2} ${x},${y + TH} ${x - TW / 2},${y + TH / 2}`;
}

// Isometric box with left/right faces and roof
function House({ i, j, h, roof }: { i: number; j: number; h: number; roof: string }) {
  const { x, y } = iso(i, j);
  const top = y - h;
  return (
    <g>
      {/* left wall */}
      <polygon
        points={`${x - TW / 2},${y + TH / 2 - h} ${x},${y + TH - h} ${x},${y + TH} ${x - TW / 2},${y + TH / 2}`}
        fill="oklch(0.78 0.05 75)"
        stroke="var(--ink)"
        strokeWidth={2}
      />
      {/* right wall */}
      <polygon
        points={`${x},${y + TH - h} ${x + TW / 2},${y + TH / 2 - h} ${x + TW / 2},${y + TH / 2} ${x},${y + TH}`}
        fill="oklch(0.66 0.05 70)"
        stroke="var(--ink)"
        strokeWidth={2}
      />
      {/* timber beams */}
      <line x1={x - TW / 2} y1={y + TH / 2 - h / 2} x2={x} y2={y + TH - h / 2} stroke="var(--timber)" strokeWidth={3} />
      <line x1={x} y1={y + TH - h / 2} x2={x + TW / 2} y2={y + TH / 2 - h / 2} stroke="var(--timber)" strokeWidth={3} />
      {/* windows (lamp lit) */}
      <rect x={x - 20} y={y + TH / 2 - h + 10} width={6} height={6} fill="var(--lamp-gold)" className="lamp-flicker" />
      <rect x={x + 12} y={y + TH / 2 - h + 10} width={6} height={6} fill="var(--lamp-gold)" />
      {/* roof: pyramid */}
      <polygon points={`${x - TW / 2 - 4},${top + TH / 2} ${x},${top - 22} ${x},${top + TH + 2}`} fill={roof} stroke="var(--ink)" strokeWidth={2} />
      <polygon
        points={`${x},${top - 22} ${x + TW / 2 + 4},${top + TH / 2} ${x},${top + TH + 2}`}
        fill={roof}
        stroke="var(--ink)"
        strokeWidth={2}
        style={{ filter: "brightness(0.78)" }}
      />
    </g>
  );
}

function Ruin({ i, j }: { i: number; j: number }) {
  const { x, y } = iso(i, j);
  return (
    <g>
      <rect x={x - 14} y={y - 10} width={10} height={26} fill="var(--ash)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={x + 2} y={y + 2} width={10} height={14} fill="oklch(0.5 0.01 270)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={x - 4} y={y - 18} width={4} height={4} fill="var(--roof-red)" className="pixel-blink" />
    </g>
  );
}

function Lamp({ i, j }: { i: number; j: number }) {
  const { x, y } = iso(i, j);
  return (
    <g>
      <rect x={x - 1} y={y - 8} width={3} height={24} fill="var(--ink)" />
      <rect x={x - 4} y={y - 14} width={9} height={8} fill="var(--lamp-gold)" stroke="var(--ink)" strokeWidth={2} className="lamp-flicker" />
    </g>
  );
}

function Agent({ i, j, color, delay }: { i: number; j: number; color: string; delay: number }) {
  const { x, y } = iso(i, j);
  return (
    <g className="agent-idle" style={{ animationDelay: `${delay}s` }}>
      <rect x={x - 5} y={y - 2} width={10} height={12} fill={color} stroke="var(--ink)" strokeWidth={2} />
      <rect x={x - 4} y={y - 10} width={8} height={8} fill="oklch(0.85 0.06 60)" stroke="var(--ink)" strokeWidth={2} />
      <rect x={x - 2} y={y - 7} width={2} height={2} fill="var(--ink)" className="pixel-blink" style={{ animationDelay: `${delay}s` }} />
    </g>
  );
}

function Banner({ i, j, color }: { i: number; j: number; color: string }) {
  const { x, y } = iso(i, j);
  return (
    <g>
      <rect x={x} y={y - 30} width={3} height={46} fill="var(--timber)" />
      <polygon points={`${x + 3},${y - 30} ${x + 22},${y - 25} ${x + 3},${y - 18}`} fill={color} stroke="var(--ink)" strokeWidth={2} className="flag-wave" />
    </g>
  );
}

const HOUSES = [
  { i: 3, j: 4, h: 34, roof: "var(--roof-red)" },
  { i: 4, j: 3, h: 40, roof: "var(--roof-blue)" },
  { i: 3, j: 10, h: 36, roof: "var(--roof-blue)" },
  { i: 4, j: 12, h: 30, roof: "var(--roof-red)" },
  { i: 11, j: 11, h: 38, roof: "var(--roof-red)" },
  { i: 12, j: 9, h: 32, roof: "var(--roof-blue)" },
  { i: 10, j: 13, h: 34, roof: "var(--roof-blue)" },
];

const AGENTS = [
  { i: 6, j: 7, color: "var(--roof-red)" },
  { i: 9, j: 6, color: "var(--roof-blue)" },
  { i: 8, j: 10, color: "var(--lamp-gold)" },
  { i: 6, j: 9.5, color: "var(--grass)" },
  { i: 10, j: 8, color: "var(--pol-teal)" },
  { i: 5, j: 5.5, color: "var(--roof-blue)" },
  { i: 11, j: 5, color: "var(--roof-red)" },
];

export function SeasonStage() {
  const tiles: { i: number; j: number; k: Kind }[] = [];
  for (let s = 0; s < 2 * N - 1; s++)
    for (let i = 0; i < N; i++) {
      const j = s - i;
      if (j >= 0 && j < N) tiles.push({ i, j, k: tileKind(i, j) });
    }

  const core = iso(C, C);
  const minX = -N * (TW / 2) - 40;
  const width = N * TW + 80;

  return (
    <svg
      viewBox={`${minX} -120 ${width} ${N * TH + 220}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* stars */}
      {Array.from({ length: 60 }, (_, n) => (
        <rect
          key={n}
          x={minX + rnd(n, 1) * width}
          y={-120 + rnd(n, 2) * 140}
          width={3}
          height={3}
          fill={n % 7 === 0 ? "var(--lamp-gold)" : "var(--foreground)"}
          opacity={0.25 + rnd(n, 3) * 0.5}
          className={n % 9 === 0 ? "pixel-blink" : undefined}
        />
      ))}

      {/* island side skirt */}
      <polygon
        points={`${iso(0, N).x},${iso(0, N).y} ${iso(N, N).x},${iso(N, N).y} ${iso(N, 0).x},${iso(N, 0).y} ${iso(N, 0).x},${iso(N, 0).y + 40} ${iso(N, N).x},${iso(N, N).y + 40} ${iso(0, N).x},${iso(0, N).y + 40}`}
        fill="var(--dusk-deep)"
        stroke="var(--ink)"
        strokeWidth={3}
      />

      {/* tiles */}
      {tiles.map(({ i, j, k }) => {
        const { x, y } = iso(i, j);
        const pal = TOP[k];
        const fill = pal[Math.floor(rnd(i, j) * pal.length)];
        return (
          <polygon
            key={`${i}-${j}`}
            points={diamond(x, y)}
            fill={fill}
            stroke="var(--ink)"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            className={k === "core" ? "core-glow" : undefined}
          />
        );
      })}

      {/* arena rings around POL core */}
      {[1, 2, 3].map((r) => (
        <ellipse
          key={r}
          cx={core.x}
          cy={core.y + TH / 2}
          rx={TW * r * 1.25}
          ry={TH * r * 1.25}
          fill="none"
          stroke={r === 1 ? "var(--pol-teal)" : r === 2 ? "var(--lamp-gold)" : "var(--roof-red)"}
          strokeWidth={3}
          strokeDasharray="8 6"
          className="ring-pulse"
          style={{ animationDelay: `${r * 0.4}s` }}
        />
      ))}

      {/* POL core crystal */}
      <g className="core-glow">
        <polygon
          points={`${core.x},${core.y - 40} ${core.x + 14},${core.y - 12} ${core.x},${core.y + 16} ${core.x - 14},${core.y - 12}`}
          fill="var(--pol-teal)"
          stroke="var(--ink)"
          strokeWidth={3}
        />
        <rect x={core.x - 4} y={core.y - 30} width={6} height={6} fill="var(--foreground)" />
      </g>

      {HOUSES.map((h) => (
        <House key={`${h.i}-${h.j}`} {...h} />
      ))}
      {([
        [13, 2],
        [12, 1],
        [14, 3],
      ] as const).map(([i, j]) => (
        <Ruin key={`r${i}-${j}`} i={i} j={j} />
      ))}
      {([
        [5, 8],
        [10, 7],
        [7, 5],
        [8, 11],
      ] as const).map(([i, j]) => (
        <Lamp key={`l${i}-${j}`} i={i} j={j} />
      ))}
      <Banner i={6} j={4} color="var(--roof-blue)" />
      <Banner i={11} j={10} color="var(--roof-red)" />
      {AGENTS.map((a, n) => (
        <Agent key={n} {...a} delay={n * 0.3} />
      ))}
    </svg>
  );
}
