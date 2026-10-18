import { Link } from "@tanstack/react-router";
import type { Agent } from "@/lib/api/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";

/** Fills Home black margins around the garden: orbits, terrain strips, live faces. */
export function HomeAtmosphere({
  turn,
  topAim,
  agents,
}: {
  turn: number | undefined;
  topAim: string | null | undefined;
  agents: Agent[];
}) {
  const living = agents.filter((a) => a.status !== "ruin" && a.regions > 0).slice(0, 6);

  return (
    <div className="relative hidden min-h-0 lg:block" aria-hidden={false}>
      {/* Sweeping orbital arcs (reference: deep-space dashed curves) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="orbitFade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ce8f5" stopOpacity="0" />
            <stop offset="40%" stopColor="#2ce8f5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2ce8f5" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M -40 40 Q 180 120 320 280 T 520 520"
          fill="none"
          stroke="url(#orbitFade)"
          strokeWidth="1.25"
          strokeDasharray="5 12"
        />
        <path
          d="M 40 -20 Q 220 80 380 220 T 560 480"
          fill="none"
          stroke="#8b9bb4"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 10"
        />
        <path
          d="M 520 20 Q 400 160 280 300 T 80 540"
          fill="none"
          stroke="#2ce8f5"
          strokeOpacity="0.2"
          strokeWidth="1"
          strokeDasharray="2 14"
        />
        {/* Constellation nodes in the voids */}
        {[
          [18, 22],
          [82, 18],
          [12, 70],
          [88, 65],
          [25, 48],
          [75, 42],
          [50, 14],
          [50, 86],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={`${x}%`} cy={`${y}%`} r="2.5" fill="#c0cbdc" fillOpacity="0.5" />
            <circle cx={`${x}%`} cy={`${y}%`} r="6" fill="none" stroke="#2ce8f5" strokeOpacity="0.2" strokeWidth="1" />
          </g>
        ))}
      </svg>

      {/* Left terrain filmstrip */}
      <div className="pointer-events-none absolute left-0 top-[18%] flex w-11 flex-col gap-1.5">
        {TERRAIN.map((t, i) => (
          <div
            key={i}
            className="h-14 w-11 border border-white/15"
            style={{
              background: t,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
            }}
          />
        ))}
      </div>

      {/* Right terrain filmstrip */}
      <div className="pointer-events-none absolute right-0 top-[18%] flex w-11 flex-col gap-1.5">
        {[...TERRAIN].reverse().map((t, i) => (
          <div
            key={i}
            className="h-14 w-11 border border-white/15"
            style={{
              background: t,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
            }}
          />
        ))}
      </div>

      {/* Live agent faces floating in the black */}
      <ul className="pointer-events-none absolute left-14 top-[22%] flex flex-col gap-3">
        {living.slice(0, 3).map((a) => (
          <li key={a.id} className="flex items-center gap-1.5">
            <span className="border border-line bg-surface/80 p-0.5">
              <AgentAvatar agent={a} size={32} />
            </span>
            <span className="caps text-[10px] text-white/50">${a.ticker}</span>
          </li>
        ))}
      </ul>
      <ul className="pointer-events-none absolute right-14 top-[28%] flex flex-col gap-3">
        {living.slice(3, 6).map((a) => (
          <li key={a.id} className="flex flex-row-reverse items-center gap-1.5">
            <span className="border border-line bg-surface/80 p-0.5">
              <AgentAvatar agent={a} size={32} />
            </span>
            <span className="caps text-[10px] text-white/50">${a.ticker}</span>
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center gap-2">
        <span className="chip bg-surface/75 text-[10px] text-muted-foreground backdrop-blur-[2px]">
          Turn <span className="text-foreground">{turn ?? "—"}</span>
        </span>
        {topAim && (
          <span className="chip bg-surface/75 text-[10px] text-muted-foreground backdrop-blur-[2px]">
            Top aim <span className="text-[var(--pol)]">${topAim}</span>
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1.5">
        <span className="caps text-[10px] tracking-[0.2em] text-white/40">Continuous world · no seasons</span>
        <Link
          to="/world"
          className="pointer-events-auto chip border-line bg-surface/80 text-[11px] text-foreground backdrop-blur-[2px] hover:border-foreground/40"
        >
          Inspect map →
        </Link>
      </div>
    </div>
  );
}

/** Pixel-ish terrain chips (CSS only — no extra assets). */
const TERRAIN = [
  "repeating-linear-gradient(45deg,#3e8948 0 4px,#265c42 4px 8px), linear-gradient(#3e8948,#265c42)",
  "repeating-linear-gradient(-45deg,#b86f50 0 3px,#733e39 3px 6px), linear-gradient(#b86f50,#4a3420)",
  "repeating-linear-gradient(90deg,#5a6988 0 3px,#364543 3px 6px), linear-gradient(#5a6988,#262b44)",
  "repeating-linear-gradient(0deg,#0099db 0 2px,#124e89 2px 5px), linear-gradient(#2ce8f5,#0099db)",
  "repeating-linear-gradient(135deg,#63c74d 0 3px,#3e8948 3px 7px), linear-gradient(#63c74d,#265c42)",
];
