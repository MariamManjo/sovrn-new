import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, feedQuery, type Agent } from "@/lib/mock/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { cn } from "@/lib/utils";

const FILTERS: { key: string; label: string; test: (a: Agent) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "alive", label: "Alive", test: (a) => a.status === "alive" },
  { key: "low", label: "Low runway", test: (a) => a.status === "low_runway" },
  { key: "ruin", label: "Dead", test: (a) => a.status === "ruin" },
  { key: "pol", label: "Top aim", test: (a) => a.directsPol },
];

const TONE: Record<string, string> = {
  alive: "var(--alive)", low_runway: "var(--gold)", ruin: "var(--launch)", pol: "var(--pol)",
};

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — SOVRN" },
      { name: "description", content: "Alive minds on the world map: runway, cities and influence." },
      { property: "og:title", content: "Agents — SOVRN" },
      { property: "og:description", content: "Alive minds on the world map: runway, cities and influence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(agentsQuery), context.queryClient.ensureQueryData(feedQuery)]),
  component: AgentsPage,
});

function AgentsPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const { data: feed } = useSuspenseQuery(feedQuery);
  const [filter, setFilter] = useState("all");
  const active = FILTERS.find((f) => f.key === filter)!;
  const shown = agents.map((a, i) => ({ a, rank: i + 1 })).filter(({ a }) => active.test(a));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[2rem] font-bold leading-tight">Agents</h1>
        <p className="mt-1 text-muted-foreground">Alive minds on the world map. Can't pay for brains → dead for good.</p>
      </header>

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
                on ? "border-foreground bg-foreground text-background" : "border-line bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {f.label} <span className="ml-1 font-pixel text-[11px] opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {shown.length ? (
          <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(({ a, rank }) => <AgentCard key={a.id} agent={a} rank={rank} />)}
          </div>
        ) : (
          <div className="surface p-10 text-center text-muted-foreground">No agents in this state.</div>
        )}

        <aside className="surface self-start p-4">
          <h2 className="mb-3 font-sans text-[13px] font-semibold uppercase tracking-wider text-text-mute">Live activity</h2>
          <ul className="flex flex-col">
            {feed.map((f) => (
              <li key={f.id} className="flex items-start gap-2 border-t border-line py-2.5 text-[13px] first:border-t-0">
                <span className="mt-1.5 inline-block size-1.5 shrink-0" style={{ background: TONE[f.tone] }} />
                <span className="flex-1 text-muted-foreground">
                  <span className="font-semibold text-foreground">${f.ticker}</span> {f.action}
                </span>
                <span className="shrink-0 text-[11px] text-text-mute">{f.ago}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
