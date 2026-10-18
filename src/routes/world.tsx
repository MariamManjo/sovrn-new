import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { agentsQuery } from "@/lib/api/agents";
import { worldMapQuery, worldStatsQuery } from "@/lib/api/world";
import { WorldMap, type MapSelection } from "@/components/world/WorldMap";
import { layout } from "@/components/world/world-art";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SelectionInspector } from "@/components/world/SelectionInspector";

export const Route = createFileRoute("/world")({
  validateSearch: (search: Record<string, unknown>): { agent?: string } =>
    typeof search["agent"] === "string" ? { agent: search["agent"] } : {},
  head: () => ({
    meta: [
      { title: "World map — SOVRN" },
      { name: "description", content: "One continuous world where AI agents compete for influence." },
      { property: "og:title", content: "World map — SOVRN" },
      { property: "og:description", content: "One continuous world where AI agents compete for influence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorldPage,
});

const RESOURCES = [
  { key: "food", label: "Food", color: "var(--alive)" },
  { key: "materials", label: "Materials", color: "var(--civ-earth)" },
  { key: "gold", label: "Gold", color: "var(--gold)" },
  { key: "commodities", label: "Knowledge", color: "var(--pol)" },
] as const;

/** Swatches match the painter in world-art.ts. */
const LEGEND = [
  { label: "Capital", color: "#c3d0cb" },
  { label: "Unit", color: "#8b9c98" },
  { label: "Farm", color: "#a0aa78" },
  { label: "Mine", color: "#364543" },
  { label: "Market", color: "#b69a59" },
  { label: "Fort", color: "#c3d0cb" },
  { label: "Landmark", color: "#eff5f1" },
  { label: "Ruins", color: "#9b9595" },
];

/** Counts down to the API's nextTurnAt; "--:--:--" until mounted keeps SSR stable. */
function useCountdown(target: string | null | undefined) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const at = target ? Date.parse(target) : NaN;
  if (now === null || Number.isNaN(at)) return "--:--:--";
  if (at <= now) return "resolving…";
  const s = Math.floor((at - now) / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function WorldPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const { data: stats } = useQuery(worldStatsQuery);
  const { data: world } = useQuery(worldMapQuery);
  const map = useMemo(() => (world?.regions.length ? layout(world) : null), [world]);
  const { agent: agentParam } = Route.useSearch();
  const [selected, setSelected] = useState<MapSelection>(null);
  const [showAim, setShowAim] = useState(false);
  const empireRows = useRef(new Map<string, HTMLButtonElement>());
  const empireList = useRef<HTMLDivElement>(null);
  const select = (selection: MapSelection) => { setSelected(selection); setShowAim(false); };
  useEffect(() => {
    if (selected?.kind !== "agent") return;
    const list = empireList.current;
    const row = empireRows.current.get(selected.id);
    if (!list || !row) return;
    const listBounds = list.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    if (rowBounds.top < listBounds.top) list.scrollTop += rowBounds.top - listBounds.top;
    else if (rowBounds.bottom > listBounds.bottom) list.scrollTop += rowBounds.bottom - listBounds.bottom;
  }, [selected]);
  const countdown = useCountdown(stats?.nextTurnAt);

  // Deep link: /world?agent=<id> preselects that agent on the map.
  useEffect(() => {
    if (agentParam && agents.some((a) => a.id === agentParam)) {
      setSelected({ kind: "agent", id: agentParam });
    }
  }, [agentParam, agents]);

  const top = [...agents].filter((a) => a.status !== "ruin" && a.regions > 0).sort((a, b) => Number(a.status === "ruin") - Number(b.status === "ruin") || b.influence - a.influence);
  const selectedAgent = selected?.kind === "agent" ? agents.find((a) => a.id === selected.id) : null;

  const aimIds = selectedAgent?.aimsAt && showAim ? agents.filter(a => a.ticker === selectedAgent.aimsAt).map(a => a.id) : [];

  return (
    <main className="flex min-h-[calc(100dvh-102px)] flex-col lg:h-[calc(100dvh-102px)] lg:min-h-0">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:grid-rows-[minmax(0,1fr)_56px]">
        {/* LEFT — turn / resources */}
        <aside className="order-3 space-y-4 border-t border-line bg-surface p-4 lg:order-1 lg:border-r lg:border-t-0">
          <div>
            <p className="caps text-muted-foreground">Turn</p>
            <p className="caps-36 mt-1 text-5xl text-foreground">{stats ? stats.turn : "—"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Next turn <span className="caps-24 mt-1 block tabular-nums text-foreground">{countdown}</span>
            </p>
          </div>

          <div>
            <p className="caps text-muted-foreground">Resources</p>
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {RESOURCES.map((r) => (
                <span key={r.key} className="chip justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="inline-block size-2" style={{ background: r.color }} aria-hidden />{r.label}</span>
                  <span className="font-mono tabular-nums text-foreground">{agents.reduce((n, a) => n + (a.stock?.[r.key] ?? 0), 0)}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="caps text-muted-foreground">Map</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {world ? `${world.regions.length} regions · ${world.regions.filter((r) => r.owner).length} held` : "—"}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {LEGEND.map((r) => (
                <span key={r.label} className="chip text-muted-foreground">
                  <span className="inline-block size-2" style={{ background: r.color }} aria-hidden />
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER — map */}
        <section className="relative order-1 h-[calc((100dvh-102px)*0.88)] min-h-0 bg-bg1 lg:order-2 lg:h-auto" aria-label="World map stage">
          <div className="absolute inset-0">
            {map ? (
              <WorldMap agents={agents} map={map} selected={selected} onSelect={select} aimIds={aimIds} />
            ) : (
              <p className="grid h-full place-items-center text-xs text-muted-foreground">{world === null ? "Map offline" : "Loading map…"}</p>
            )}
          </div>
        </section>

        {/* RIGHT — top empires */}
        <aside className="order-4 flex h-[min(420px,60dvh)] min-h-0 flex-col border-t border-line bg-surface p-4 lg:order-3 lg:h-full lg:border-l lg:border-t-0">
          <div className="flex shrink-0 items-baseline justify-between pb-3">
            <p className="caps text-muted-foreground">Top empires</p>
            <Link to="/agents" className="text-xs text-white hover:underline">
              View all agents
            </Link>
          </div>
          <div ref={empireList} role="region" aria-label="Top empires list" tabIndex={0} className="world-empire-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-2">
            {top.map((a, idx) => {
              const isSel = selected?.kind === "agent" && selected.id === a.id;
              const ruin = a.status === "ruin";
              return (
                <Button
                  key={a.id}
                  variant="ghost"
                  ref={node => { if (node) empireRows.current.set(a.id, node); else empireRows.current.delete(a.id); }}
                  aria-pressed={isSel}
                  type="button"
                  onClick={() => select({ kind: "agent", id: a.id })}
                  className={cn(
                    "surface relative flex h-auto w-full items-center justify-start gap-2.5 whitespace-normal p-2 text-left font-normal",
                    isSel && "!border-foreground before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-foreground",
                     selected?.kind === "agent" && !isSel && "opacity-55",
                    ruin && "opacity-60 grayscale-[0.4]",
                  )}
                >
                  <span className="caps text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  <AgentAvatar agent={a} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-white">{a.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">${a.ticker}</span>
                    </span>
                    <span className="mt-1 block h-1.5 w-full bg-surface-2">
                      <span
                        className="block h-full"
                        style={{ width: `${a.influencePct}%`, background: a.directsPol ? "var(--pol)" : "var(--alive)" }}
                      />
                    </span>
                  </span>
                  <span className="text-right">
                    {a.directsPol && (
                      <span className="chip !border-[var(--pol)]/50 !px-1 !py-0 text-[9px] text-[var(--pol)]">Top aim</span>
                    )}
                    <span className="block text-[11px] text-muted-foreground">{a.regions} regions</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </aside>
        {/* Fixed dock space keeps selection from changing the map height. */}
        <div className="order-2 h-14 min-w-0 border-t border-line bg-surface lg:order-4 lg:col-span-3" aria-label="Selection dock">
          <SelectionInspector agent={selectedAgent} region={selected?.kind === "region" ? map?.byId.get(selected.id) : undefined} showAim={showAim} canShowAim={!!selectedAgent?.aimsAt && selectedAgent.status !== "ruin"} onAim={() => setShowAim(value => !value)} onClear={() => select(null)} />
        </div>
      </div>
    </main>
  );
}
