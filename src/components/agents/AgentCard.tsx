import { Link } from "@tanstack/react-router";
import type { Agent } from "@/lib/api/agents";
import { AgentAvatar } from "./AgentAvatar";
import { usd } from "@/lib/utils";

export const STATUS_META = {
  alive: { label: "Alive", color: "var(--alive)" },
  low_runway: { label: "Alive · low runway", color: "var(--gold)" },
  ruin: { label: "Dead", color: "var(--launch)" },
} as const;

export const aimOf = (a: Agent): string | null => (a.status === "ruin" ? null : a.aimsAt);

/** Runway label, e.g. "$0.012/turn · 34 turns". */
export const runwayLabel = (a: Agent) =>
  a.status === "ruin" ? "0 turns left" : `${usd(a.burnPerTurn)}/turn · ${a.turnsLeft ?? "—"} turns`;

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
    <div className="col-span-3 grid grid-cols-subgrid items-center text-[12px]">
      <span className="text-text-mute">{label}</span>
      <span className="h-1.5 bg-surface-2">
        {pct !== undefined && <span className="block h-full" style={{ width: `${pct}%`, background: color }} />}
      </span>
      <span className="whitespace-nowrap font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function AgentStats({ agent }: { agent: Agent }) {
  const dead = agent.status === "ruin";
  const turnsLeft = dead ? 0 : (agent.turnsLeft ?? 0);
  const runColor = dead ? "var(--launch)" : agent.status === "low_runway" ? "var(--gold)" : "var(--alive)";
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] gap-x-3 gap-y-2">
      <Meter label="Runway" value={runwayLabel(agent)} pct={Math.min((turnsLeft / 50) * 100, 100)} color={runColor} />
      <Meter label="Regions" value={String(agent.regions)} pct={Math.min((agent.regions / 10) * 100, 100)} color="var(--civ-earth)" />
      <Meter label="Influence" value={`${agent.influencePct.toFixed(1)}%`} pct={agent.influencePct} color="var(--influence)" />
    </div>
  );
}

export function AgentCard({ agent, rank }: { agent: Agent; rank: number }) {
  const dead = agent.status === "ruin";
  const aim = aimOf(agent);
  const m = STATUS_META[agent.status];
  return (
    <Link
      to="/agent/$id"
      params={{ id: agent.id }}
      className={`surface flex items-start gap-4 p-5 hover:border-foreground/30 focus-visible:outline focus-visible:outline-foreground ${dead ? "opacity-55 grayscale" : ""}`}
    >
      <AgentAvatar agent={agent} size={64} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-foreground">{agent.name}</span>
          <span className="font-mono text-xs text-muted-foreground">${agent.ticker}</span>
          <span className="chip ml-auto shrink-0"><span className="inline-block size-1.5" style={{ background: m.color }} />{m.label}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="caps-24 tabular-nums text-foreground">{dead ? 0 : (agent.turnsLeft ?? "—")}</span>
          <span className="text-sm text-muted-foreground">turns left · {usd(agent.burnPerTurn)}/turn</span>
        </div>
        <div className="mt-1 text-xs text-text-mute">
          #{String(rank).padStart(2, "0")} · {agent.regions} regions · {agent.influencePct.toFixed(1)}% influence · {agent.archetype}
          {aim && <span className="text-[var(--pol)]"> · → ${aim}</span>}
        </div>
        <p className="mt-2 truncate border-t border-line pt-2 text-sm text-muted-foreground">{agent.lastAction}</p>
      </div>
    </Link>
  );
}
