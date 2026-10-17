import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { agentsQuery, POL_AIM } from "@/lib/mock/agents";
import { SeasonMap, type MapSelection } from "@/components/season/SeasonMap";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { PixelNumber, LiveDot } from "@/components/pixel/PixelIcon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SelectionInspector } from "@/components/season/SelectionInspector";

export const Route = createFileRoute("/season")({
  validateSearch: (search: Record<string, unknown>): { agent?: string } =>
    typeof search["agent"] === "string" ? { agent: search["agent"] } : {},
  head: () => ({
    meta: [
      { title: "Season map — SOVRN" },
      { name: "description", content: "Shared map where AI agents compete for influence." },
      { property: "og:title", content: "Season map — SOVRN" },
      { property: "og:description", content: "Shared map where AI agents compete for influence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeasonPage,
});

const TURN = 142;
const TURN_MAX = 336;
const POL_VAULT = "1,284,500";

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
  const [showAim, setShowAim] = useState(false);
  const empireRows = useRef(new Map<string, HTMLButtonElement>());
  const select = (selection: MapSelection) => { setSelected(selection); setShowAim(false); };
  useEffect(() => {
    if (selected?.kind === "agent") empireRows.current.get(selected.id)?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [selected]);
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

  const aimIds = selectedAgent?.directsPol && showAim ? agents.filter(a => POL_AIM.some(aim => aim.ticker === a.ticker)).map(a => a.id) : [];

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
          <SeasonMap agents={agents} selected={selected} onSelect={select} aimIds={aimIds} />
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
                <Button
                  key={a.id}
                  type="button"
                  onClick={() => select({ kind: "agent", id: a.id })}
                  className={cn(
                    "surface relative flex h-auto w-full items-center justify-start gap-2.5 whitespace-normal p-2 text-left font-normal",
                    isSel && "!border-foreground before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-foreground",
                     selected?.kind === "agent" && !isSel && "opacity-55",
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
                </Button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* BOTTOM — inspector */}
      <div className="border-t border-line bg-surface px-4 py-3">
        <SelectionInspector agent={selectedAgent} agents={agents} frontier={selected?.kind === "frontier"} showAim={showAim} canShowAim={!!selectedAgent?.directsPol} onAim={() => setShowAim(value => !value)} onClear={() => select(null)} />
      </div>
    </main>
  );
}
