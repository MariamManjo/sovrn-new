import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Crosshair, MousePointer2, X } from "lucide-react";
import type { Agent } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Button } from "@/components/ui/button";

export function SelectionInspector({ agent, agents, frontier, showAim, canShowAim, onAim, onClear }: {
  agent: Agent | null | undefined;
  agents: Agent[];
  frontier: boolean;
  showAim: boolean;
  canShowAim: boolean;
  onAim: () => void;
  onClear: () => void;
}) {
  if (!agent) return (
    <div className="mx-auto flex min-h-20 max-w-5xl items-center justify-center gap-3 text-muted-foreground" aria-live="polite">
      <MousePointer2 className="size-5 opacity-40" aria-hidden />
      <p className="text-sm">{frontier ? "Unclaimed / frontier" : "Click a city or empire to inspect"}</p>
      {frontier && <Button variant="ghost" size="sm" onClick={onClear}><X />Clear</Button>}
    </div>
  );
  const metrics = [
    { label: "Cities", value: agent.cities, max: Math.max(1, ...agents.map(a => a.cities)), unit: "" },
    { label: "Influence", value: agent.influence, max: Math.max(1, ...agents.map(a => a.influence)), unit: "" },
    { label: "Runway", value: agent.runwaySol, max: Math.max(1, ...agents.map(a => a.runwaySol)), unit: " SOL" },
  ];
  return (
    <div className="selection-inspector mx-auto max-w-5xl border border-foreground bg-surface-2 p-4" aria-label={`${agent.name} inspector`} aria-live="polite">
      <div className="flex flex-wrap items-start gap-4">
        <div className="shrink-0 border border-line bg-surface p-2"><AgentAvatar agent={agent} size={64} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-foreground">{agent.name}</span>
            <span className="font-pixel text-xs text-muted-foreground">${agent.ticker}</span>
            <span className={`chip ${agent.status === "alive" ? "text-alive" : agent.status === "ruin" ? "text-ruin" : "text-gold"}`}>
              <span className="size-1.5 bg-current" aria-hidden />{agent.status === "low_runway" ? "Low runway" : agent.status === "ruin" ? "Ruin" : "Alive"}
            </span>
            {agent.directsPol && <span className="chip text-pol">Directs POL</span>}
          </div>
          <p className="mt-2 truncate text-sm text-muted-foreground" title={agent.lastAction}>{agent.lastAction}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}><X />Clear</Button>
      </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {metrics.map(metric => <div key={metric.label}>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 font-pixel text-sm text-foreground">{metric.value}<span className="font-sans text-xs">{metric.unit}</span></p>
              <meter className="selection-meter mt-2 block h-1.5 w-full" aria-label={metric.label} min={0} max={metric.max} value={metric.value} />
            </div>)}
          </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" size="sm" aria-pressed={showAim} disabled={!canShowAim} title={canShowAim ? "Preview mock POL aim" : "No mock aim available for this agent"} onClick={onAim}><Crosshair />{showAim ? "Hide aim" : "Show aim"}</Button>
        <Button asChild variant="outline" size="sm"><Link to="/agent/$id" params={{ id: agent.id }}>View agent<ArrowUpRight /></Link></Button>
      </div>
    </div>
  );
}