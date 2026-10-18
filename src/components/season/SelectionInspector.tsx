import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MousePointer2, X } from "lucide-react";
import type { Agent } from "@/lib/api/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Button } from "@/components/ui/button";
import { usd } from "@/lib/utils";

export function SelectionInspector({ agent, frontier, showAim, canShowAim, onAim, onClear }: {
  agent: Agent | null | undefined;
  frontier: boolean;
  showAim: boolean;
  canShowAim: boolean;
  onAim: () => void;
  onClear: () => void;
}) {
  // Empty state — one thin line, no frame.
  if (!agent) return (
    <div className="flex h-full items-center justify-center gap-2 text-muted-foreground" aria-live="polite">
      <MousePointer2 className="size-4 opacity-40" aria-hidden />
      <p className="whitespace-nowrap text-xs">{frontier ? "Unclaimed / frontier" : "Click a settlement or empire to inspect"}</p>
      {frontier && (
        <Button variant="ghost" type="button" onClick={onClear} className="h-11 px-2 text-xs text-foreground">
          Clear
        </Button>
      )}
    </div>
  );

  return (
    <div
      className="selection-inspector flex h-full w-full items-center gap-3 overflow-x-auto overscroll-x-contain whitespace-nowrap px-3"
      aria-label={`${agent.name} inspector`}
      aria-live="polite"
    >
      <div className="shrink-0"><AgentAvatar agent={agent} size={32} /></div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{agent.name}</span>
        <span className="shrink-0 font-pixel text-[11px] text-muted-foreground">${agent.ticker}</span>
        <span className={`chip !px-1 !py-0 text-[10px] ${agent.status === "alive" ? "text-alive" : agent.status === "ruin" ? "text-ruin" : "text-gold"}`}>
          {agent.status === "low_runway" ? "Low runway" : agent.status === "ruin" ? "Ruin" : "Alive"}
        </span>
      </div>

      <dl className="flex shrink-0 items-center gap-3 text-xs">
        {[
          { label: "Regions", value: agent.regions },
          { label: "Inf", value: `${agent.influencePct.toFixed(1)}%` },
          { label: "Runway", value: usd(agent.runwayUsd) },
        ].map(metric => (
          <div key={metric.label} className="flex items-baseline gap-1">
            <dt className="text-muted-foreground">{metric.label}</dt>
            <dd className="tabular-nums text-foreground">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {canShowAim && <Button
          variant="ghost"
          type="button"
          onClick={onAim}
          aria-pressed={showAim}
          disabled={!canShowAim}
          title={canShowAim ? "Show where this agent points its POL share" : "No POL aim for this agent"}
          className={`h-11 px-2 text-[11px] hover:underline ${showAim ? "text-pol" : "text-muted-foreground"}`}
        >
          {showAim ? "Hide aim" : "Show aim"}
        </Button>}
        <Button asChild variant="ghost" size="sm" className="h-11 gap-1 px-2 text-xs">
          <Link to="/agent/$id" params={{ id: agent.id }} aria-label={`View ${agent.name}`}>View<ArrowUpRight className="size-3" /></Link>
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={onClear} aria-label="Clear selection" title="Clear selection" className="size-11 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
