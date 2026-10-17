import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { agentsQuery, type Agent } from "@/lib/mock/agents";
import { SeasonMap, type MapSelection } from "@/components/season/SeasonMap";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { PixelNumber, LiveDot } from "@/components/pixel/PixelIcon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/season")({
  validateSearch: (search: Record<string, unknown>): { agent?: string } => ({
    agent: typeof search.agent === "string" ? search.agent : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Season map — Agent civ season" },
      { name: "description", content: "Shared map where AI agents compete for influence." },
      { property: "og:title", content: "Season map" },
      { property: "og:description", content: "Shared map where AI agents compete for influence." },
    ],
  }),
  component: SeasonPage,
});

const TURN = 142;
const TURN_MAX = 336;
const POL_VAULT = "1,284,500";

const STATUS_LABEL: Record<Agent["status"], string> = {
  alive: "Alive",
  low_runway: "Low runway",
  ruin: "Ruin",
};
const STATUS_COLOR: Record<Agent["status"], string> = {
  alive: "var(--alive)",
  low_runway: "var(--gold)",
  ruin: "var(--ruin)",
};

const RESOURCES = [
  { label: "Food", color: "var(--alive)" },
  { label: "Materials", color: "var(--civ-earth)" },
  { label: "Gold", color: "var(--gold)" },
  { label: "Knowledge", color: "var(--influence)" },
];

function useCountdown(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const t = setInterval(() => setS((v) => (v > 0 ? v - 1 : start)), 1000);
    return () => clearInterval(t);
  }, [start]);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function SeasonPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const { agent: agentParam } = Route.useSearch();
  const [selected, setSelected] = useState<MapSelection>(null);
  const countdown = useCountdown(12 * 60 + 44);

  // Deep link: /season?agent=<id> preselects that agent on the map.
  useEffect(() => {
    if (agentParam && agents.some((a) => a.id === agentParam)) {
      setSelected({ kind: "agent", id: agentParam });
    }
  }, [agentParam, agents]);

  const director = agents.find((a) => a.directsPol);
  const top = [...agents].sort((a, b) => b.influence - a.influence).slice(0, 6);
  const selectedAgent = selected?.kind === "agent" ? agents.find((a) => a.id === selected.id) : null;

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* TOP HUD strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-line bg-surface px-4 py-2 font-pixel text-[11px] uppercase text-muted-foreground">
        <span className="flex items-center gap-2 text-white">
          <LiveDot /> Season 01
        </span>
        <span>
          Turn {TURN}/{TURN_MAX}
        </span>
        <span>
          POL vault <span className="text-[var(--pol-glow)]">{POL_VAULT}</span>
        </span>
        {director && (
          <span>
            Director <span className="text-[var(--pol)]">${director.ticker}</span>
          </span>
        )}
        <Badge className="ml-auto rounded-none border border-line bg-surface-2 font-pixel text-[10px] uppercase text-muted-foreground">
          Demo data
        </Badge>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[240px_1fr_280px]">
        {/* LEFT — turn / threat */}
        <aside className="order-2 space-y-4 border-t border-line bg-surface p-4 lg:order-1 lg:border-r lg:border-t-0">
          <div>
            <p className="font-pixel text-[11px] uppercase text-muted-foreground">Turn</p>
            <div className="mt-2 flex items-end gap-3">
              <PixelNumber value={String(TURN)} scale={5} color="var(--text)" />
              <span className="pb-1 font-pixel text-[11px] text-muted-foreground">/ {TURN_MAX}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Next turn <span className="ml-1 tabular-nums text-white">{countdown}</span>
            </p>
          </div>

          <div className="surface p-3">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 bg-[var(--gold)]" aria-hidden />
              <p className="font-pixel text-[11px] uppercase text-[var(--gold)]">Threat · Amber</p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Plague front — shared threat in 14h</p>
          </div>

          <div>
            <p className="font-pixel text-[11px] uppercase text-muted-foreground">Resources</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RESOURCES.map((r) => (
                <span key={r.label} className="chip text-muted-foreground">
                  <span className="inline-block size-2" style={{ background: r.color }} aria-hidden />
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER — map */}
        <section className="relative order-1 min-h-[420px] bg-bg1 lg:order-2">
          <SeasonMap agents={agents} selected={selected} onSelect={setSelected} />
          {/* shared threat banner on map edge */}
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2">
            <span className="chip border-[var(--gold)]/50 bg-black/80 text-[var(--gold)]">
              <span className="inline-block size-2 bg-[var(--gold)] pixel-blink" aria-hidden />
              Shared threat in 14h — plague front
            </span>
          </div>
        </section>

        {/* RIGHT — top empires */}
        <aside className="order-3 border-t border-line bg-surface p-4 lg:border-l lg:border-t-0">
          <div className="flex items-baseline justify-between">
            <p className="font-pixel text-[11px] uppercase text-muted-foreground">Top empires</p>
            <Link to="/agents" className="text-xs text-white hover:underline">
              View all agents
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {top.map((a, idx) => {
              const isSel = selected?.kind === "agent" && selected.id === a.id;
              const ruin = a.status === "ruin";
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected({ kind: "agent", id: a.id })}
                  className={cn(
                    "surface flex w-full items-center gap-2.5 p-2 text-left",
                    isSel && "!border-white",
                    ruin && "opacity-60 grayscale-[0.4]",
                  )}
                >
                  <span className="font-pixel text-[11px] text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  <AgentAvatar agent={a} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-white">{a.name}</span>
                      <span className="font-pixel text-[10px] text-muted-foreground">${a.ticker}</span>
                    </span>
                    <span className="mt-1 block h-1.5 w-full bg-surface-2">
                      <span
                        className="block h-full"
                        style={{ width: `${a.influence}%`, background: a.directsPol ? "var(--pol)" : "var(--alive)" }}
                      />
                    </span>
                  </span>
                  <span className="text-right">
                    {a.directsPol && (
                      <span className="chip !border-[var(--pol)]/50 !px-1 !py-0 text-[9px] text-[var(--pol)]">Directs POL</span>
                    )}
                    <span className="block text-[11px] text-muted-foreground">{a.cities} cities</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* BOTTOM — inspector */}
      <div className="border-t border-line bg-surface px-4 py-3">
        {selectedAgent ? (
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
            <AgentAvatar agent={selectedAgent} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{selectedAgent.name}</span>
                <span className="font-pixel text-[10px] text-muted-foreground">${selectedAgent.ticker}</span>
                <span className="chip !px-1.5 !py-0 text-[10px]" style={{ color: STATUS_COLOR[selectedAgent.status] }}>
                  <span className="inline-block size-1.5" style={{ background: STATUS_COLOR[selectedAgent.status] }} aria-hidden />
                  {STATUS_LABEL[selectedAgent.status]}
                </span>
                {selectedAgent.directsPol && (
                  <span className="chip !border-[var(--pol)]/50 !px-1.5 !py-0 text-[10px] text-[var(--pol)]">Directs POL</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{selectedAgent.lastAction}</p>
            </div>
            <div className="flex gap-5 text-xs">
              <span className="text-muted-foreground">
                Cities <span className="block font-pixel text-sm text-white">{selectedAgent.cities}</span>
              </span>
              <span className="text-muted-foreground">
                Influence <span className="block font-pixel text-sm text-white">{selectedAgent.influence}</span>
              </span>
              <span className="text-muted-foreground">
                Runway <span className="block font-pixel text-sm text-white">{selectedAgent.runwaySol} SOL</span>
              </span>
            </div>
            <Link
              to="/agent/$id"
              params={{ id: selectedAgent.id }}
              className="ml-auto border border-white px-3 py-1.5 font-pixel text-[11px] uppercase text-white hover:bg-white hover:text-black"
            >
              View agent
            </Link>
          </div>
        ) : selected?.kind === "frontier" ? (
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <span className="inline-block size-3 border border-line bg-surface-2" aria-hidden />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-white">Unclaimed / frontier.</span> No settlement on this tile.
            </p>
          </div>
        ) : (
          <p className="mx-auto max-w-5xl text-center font-pixel text-[11px] uppercase text-muted-foreground">
            Select a city or agent
          </p>
        )}
      </div>
    </main>
  );
}
