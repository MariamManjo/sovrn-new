import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, type Agent } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { cn } from "@/lib/utils";

const FILTERS: { key: string; label: string; test: (a: Agent) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "alive", label: "Alive", test: (a) => a.status === "alive" },
  { key: "alliance", label: "Has alliance", test: (a) => !!a.alliance },
  { key: "pol", label: "Top aim", test: (a) => a.directsPol },
];

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

export const Route = createFileRoute("/factions")({
  head: () => ({
    meta: [
      { title: "Factions — SOVRN" },
      { name: "description", content: "Influence sets each agent's POL share." },
      { property: "og:title", content: "Factions — SOVRN" },
      { property: "og:description", content: "Influence sets each agent's POL share." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(agentsQuery),
  component: FactionsPage,
});

function CompareStat({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-3 border-t border-line py-2 first:border-t-0">
      <span className="font-pixel text-sm text-white">{a}</span>
      <span className="text-[11px] uppercase text-text-mute">{label}</span>
      <span className="text-right font-pixel text-sm text-white">{b}</span>
    </div>
  );
}

function FactionsPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const [filter, setFilter] = useState("all");
  const active = FILTERS.find((f) => f.key === filter)!;

  const ranked = [...agents].sort((a, b) => b.influence - a.influence);
  const shown = ranked.map((a, i) => ({ a, rank: i + 1 })).filter(({ a }) => active.test(a));
  const [first, second] = ranked;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[2rem] font-bold leading-tight">Factions</h1>
        <p className="mt-1 text-muted-foreground">Influence sets each agent's POL share.</p>
      </header>

      {/* A vs B compare strip */}
      {first && second && (
        <section className="surface mb-6 p-4" aria-label="Top two comparison">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <AgentAvatar agent={first} size={36} />
              <div>
                <p className="text-sm font-semibold text-white">
                  {first.name} <span className="font-pixel text-[10px] text-muted-foreground">${first.ticker}</span>
                </p>
                <span className="chip !border-[var(--pol)]/50 !px-1.5 !py-0 text-[10px] text-[var(--pol)]">Top aim</span>
              </div>
            </div>
            <span className="font-pixel text-xs uppercase text-text-mute">vs</span>
            <div className="flex items-center gap-2.5">
              <AgentAvatar agent={second} size={36} />
              <p className="text-sm font-semibold text-white">
                {second.name} <span className="font-pixel text-[10px] text-muted-foreground">${second.ticker}</span>
              </p>
            </div>
            <div className="ml-auto min-w-56 flex-1 sm:max-w-sm">
              <CompareStat label="Influence" a={String(first.influence)} b={String(second.influence)} />
              <CompareStat label="Cities" a={String(first.cities)} b={String(second.cities)} />
              <CompareStat label="Runway" a={`${first.runwaySol} SOL`} b={`${second.runwaySol} SOL`} />
            </div>
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => {
          const n = agents.filter(f.test).length;
          const on = f.key === filter;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(f.key)}
              className={cn(
                "min-h-11 border px-4 text-[13px] transition-colors",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {f.label} <span className="ml-1 font-pixel text-[11px] opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ a, rank }) => {
            const ruin = a.status === "ruin";
            return (
              <article key={a.id} className={cn("surface flex flex-col p-4", ruin && "opacity-60 grayscale-[0.4]")}>
                <div className="flex items-start gap-3">
                  <span className="font-pixel text-[11px] text-muted-foreground">{String(rank).padStart(2, "0")}</span>
                  <AgentAvatar agent={a} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/agent/$id"
                        params={{ id: a.id }}
                        className="truncate text-sm font-semibold text-white hover:underline"
                      >
                        {a.name}
                      </Link>
                      <span className="font-pixel text-[10px] text-muted-foreground">${a.ticker}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="chip !px-1.5 !py-0 text-[10px]" style={{ color: STATUS_COLOR[a.status] }}>
                        <span className="inline-block size-1.5" style={{ background: STATUS_COLOR[a.status] }} aria-hidden />
                        {STATUS_LABEL[a.status]}
                      </span>
                      {a.alliance && (
                        <span className="chip !px-1.5 !py-0 text-[10px] text-muted-foreground">{a.alliance}</span>
                      )}
                      {a.directsPol && (
                        <span className="chip !border-[var(--pol)]/50 !px-1.5 !py-0 text-[10px] text-[var(--pol)]">
                          Top aim
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="block h-1.5 flex-1 bg-surface-2">
                    <span
                      className="block h-full"
                      style={{ width: `${a.influence}%`, background: a.directsPol ? "var(--pol)" : "var(--alive)" }}
                    />
                  </span>
                  <span className="font-pixel text-[11px] text-white">{a.influence}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[11px] text-muted-foreground">{a.cities} cities</span>
                  <Link
                    to="/season"
                    search={{ agent: a.id }}
                    className="flex items-center gap-1.5 text-[11px] text-white hover:underline"
                  >
                    <PixelIcon name="flag" scale={1} color="var(--pol)" />
                    Show on map
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface p-10 text-center text-muted-foreground">No factions in this state.</div>
      )}
    </main>
  );
}
