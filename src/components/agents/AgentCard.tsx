import { Link } from "@tanstack/react-router";
import type { Agent } from "@/lib/mock/agents";
import { AgentAvatar } from "./AgentAvatar";

export const STATUS_META = {
  alive: { label: "Alive", color: "var(--alive)" },
  low_runway: { label: "Alive · low runway", color: "var(--gold)" },
  ruin: { label: "Dead", color: "var(--launch)" },
} as const;

/** Mock: where each agent points its POL share (mirrors /pol). */
const AIM_AT: Record<string, string | null> = {
  vesper: "VSP", nyx: "NYX", helix: "HLX", mira: "MIR", orin: "VSP", sable: "VSP",
  kite: "HLX", loom: "MIR", rook: "ROOK", dusk: "DSK", quill: null, ash: null,
};
export const aimOf = (a: Agent): string | null => (a.status === "ruin" ? null : (AIM_AT[a.id] ?? null));

export function StatusChip({ agent }: { agent: Agent }) {
  const m = STATUS_META[agent.status];
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="chip"><span className="inline-block size-1.5" style={{ background: m.color }} />{m.label}</span>
      {agent.directsPol && (
        <span className="chip"><span className="inline-block size-1.5" style={{ background: "var(--pol)" }} />Top aim</span>
      )}
    </div>
  );
}

function Meter({ label, value, pct, color }: { label: string; value: string; pct?: number; color: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-[12px]">
      <span className="text-text-mute">{label}</span>
      <span className="h-1.5 bg-surface-2">
        {pct !== undefined && <span className="block h-full" style={{ width: `${pct}%`, background: color }} />}
      </span>
      <span className="font-pixel tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function AgentStats({ agent }: { agent: Agent }) {
  const dead = agent.status === "ruin";
  const daysLeft = dead || agent.burnPerDay === 0 ? 0 : agent.runwaySol / agent.burnPerDay;
  const runColor = dead ? "var(--launch)" : daysLeft < 3 ? "var(--gold)" : "var(--alive)";
  return (
    <div className="flex flex-col gap-2">
      <Meter
        label="Runway"
        value={dead ? "0d left" : `${agent.burnPerDay} SOL/d · ${daysLeft.toFixed(1)}d`}
        pct={dead ? 0 : Math.min((daysLeft / 15) * 100, 100)}
        color={runColor}
      />
      <Meter label="Cities" value={String(agent.cities)} pct={(agent.cities / 6) * 100} color="var(--civ-earth)" />
      <Meter label="Influence" value={`${agent.influence}%`} pct={agent.influence} color="var(--influence)" />
    </div>
  );
}

export function AgentCard({ agent, rank }: { agent: Agent; rank: number }) {
  const dead = agent.status === "ruin";
  const aim = aimOf(agent);
  return (
    <Link
      to="/agent/$id"
      params={{ id: agent.id }}
      className={`surface flex flex-col gap-4 p-4 transition-transform hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:outline focus-visible:outline-foreground ${dead ? "opacity-55 grayscale" : ""}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 border border-line bg-background p-1">
          <AgentAvatar agent={agent} size={56} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="truncate">
              <span className="font-semibold text-foreground">{agent.name}</span>{" "}
              <span className="text-[12px] text-text-mute">${agent.ticker}</span>
            </div>
            <span className="font-pixel text-[11px] text-text-mute">#{String(rank).padStart(2, "0")}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">{agent.persona} · {agent.modelTier}</div>
          <div className="mt-2"><StatusChip agent={agent} /></div>
        </div>
      </div>
      <AgentStats agent={agent} />
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-[12px] text-muted-foreground">
        <span className="truncate">{agent.lastAction}</span>
        {aim && <span className="shrink-0 font-pixel text-[10px] text-[var(--pol)]">→ ${aim}</span>}
      </div>
    </Link>
  );
}
