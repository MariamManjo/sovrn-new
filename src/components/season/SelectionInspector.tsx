import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MousePointer2, X } from "lucide-react";
import type { Agent } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";

export function SelectionInspector({ agent, agents, frontier, showAim, canShowAim, onAim, onClear }: {
  agent: Agent | null | undefined;
  agents: Agent[];
  frontier: boolean;
  showAim: boolean;
  canShowAim: boolean;
  onAim: () => void;
  onClear: () => void;
}) {
  // Empty state — one thin line, no frame.
  if (!agent) return (
    <div className="flex min-h-9 items-center justify-center gap-2 text-muted-foreground" aria-live="polite">
      <MousePointer2 className="size-4 opacity-40" aria-hidden />
      <p className="text-sm">{frontier ? "Unclaimed / frontier" : "Click a city or empire to inspect"}</p>
      {frontier && (
        <button type="button" onClick={onClear} className="text-xs text-white hover:underline">
          Clear
        </button>
      )}
    </div>
  );

  const citiesMax = Math.max(1, ...agents.map(a => a.cities));
  const influenceMax = Math.max(1, ...agents.map(a => a.influence));
  const runwayMax = Math.max(1, ...agents.map(a => a.runwaySol));

  return (
    // Compact single-row inspector (~64px tall).
    <div
      className="selection-inspector mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 border border-foreground bg-surface-2 py-2 pl-2 pr-3"
      aria-label={`${agent.name} inspector`}
      aria-live="polite"
    >
      <AgentAvatar agent={agent} size={40} />
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{agent.name}</span>
        <span className="shrink-0 font-pixel text-[11px] text-muted-foreground">${agent.ticker}</span>
        <span className={`chip !px-1 !py-0 text-[10px] ${agent.status === "alive" ? "text-alive" : agent.status === "ruin" ? "text-ruin" : "text-gold"}`}>
          {agent.status === "low_runway" ? "Low runway" : agent.status === "ruin" ? "Ruin" : "Alive"}
        </span>
        {agent.directsPol && <span className="chip !px-1 !py-0 text-[10px] text-pol">Directs POL</span>}
      </div>

      {/* Numbers only, with thin 4px bars */}
      <dl className="ml-auto flex items-center gap-3 sm:gap-4">
        {[
          { label: "Cities", value: agent.cities, max: citiesMax },
          { label: "Influence", value: agent.influence, max: influenceMax },
          { label: "Runway", value: agent.runwaySol, max: runwayMax, unit: " SOL" },
        ].map(metric => (
          <div key={metric.label} className="min-w-0">
            <dd className="font-pixel text-[13px] leading-none text-foreground">
              {metric.value}<span className="font-sans text-[10px] text-muted-foreground">{metric.unit ?? ""}</span>
            </dd>
            <dt className="mt-0.5 text-[10px] leading-none text-muted-foreground">{metric.label}</dt>
            <meter className="selection-meter mt-1 block h-1 w-full" min={0} max={metric.max} value={metric.value} aria-label={metric.label} />
          </div>
        ))}
      </dl>

      {/* One short last-action line — hidden on narrow widths */}
      <p className="hidden min-w-0 max-w-[16rem] flex-1 truncate text-xs text-muted-foreground md:block" title={agent.lastAction}>
        {agent.lastAction}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onAim}
          aria-pressed={showAim}
          disabled={!canShowAim}
          title={canShowAim ? "Preview mock POL aim" : "No mock aim available for this agent"}
          className={`px-1 text-[11px] hover:underline disabled:cursor-not-allowed disabled:opacity-40 ${showAim ? "text-pol" : "text-muted-foreground"}`}
        >
          {showAim ? "Hide aim" : "Show aim"}
        </button>
        <Button asChild variant="outline" size="sm" className="h-7 gap-1 !px-2 text-[11px]">
          <Link to="/agent/$id" params={{ id: agent.id }}>View agent<ArrowUpRight className="size-3" /></Link>
        </Button>
        <button type="button" onClick={onClear} aria-label="Clear selection" className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
