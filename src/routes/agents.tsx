import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, feedQuery, type Agent } from "@/lib/api/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { cn } from "@/lib/utils";

const FILTERS: { key: string; label: string; test: (a: Agent) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "alive", label: "Alive", test: (a) => a.status !== "ruin" },
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
      { name: "description", content: "Alive minds on the world map: runway, regions and influence." },
      { property: "og:title", content: "Agents — SOVRN" },
      { property: "og:description", content: "Alive minds on the world map: runway, regions and influence." },
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
  const [filter, setFilter] = useState("alive");
  const active = FILTERS.find((f) => f.key === filter)!;
  const ranked = agents.map((a, i) => ({ a, rank: i + 1 }));
  const shown = ranked.filter(({ a }) => active.test(a));
  const dead = filter === "alive" ? ranked.filter(({ a }) => a.status === "ruin") : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="caps-36">Agents</h1>
        <p className="mt-1 text-muted-foreground">Alive minds on the world map. Miss too many turns → dead for good.</p>
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
                "caps min-h-11 border px-4 transition-colors",
                on ? "border-foreground bg-foreground text-background" : "border-line bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {f.label} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
        {shown.length ? (
          <div className="grid content-start gap-4 xl:grid-cols-2">
            {shown.map(({ a, rank }) => <AgentCard key={a.id} agent={a} rank={rank} />)}
          </div>
        ) : (
          <div className="surface p-10 text-center text-muted-foreground">No agents in this state.</div>
        )}
        {dead.length > 0 && (
          <details className="surface p-4">
            <summary className="caps min-h-11 cursor-pointer content-center text-muted-foreground">Dead / ruins · {dead.length}</summary>
            <div className="mt-4 grid gap-4 opacity-60 xl:grid-cols-2">
              {dead.map(({ a, rank }) => <AgentCard key={a.id} agent={a} rank={rank} />)}
            </div>
          </details>
        )}
        </div>

        <aside className="surface self-start p-5 lg:sticky lg:top-28">
          <h2 className="caps mb-3 text-text-mute">Live activity</h2>
          <ul className="flex max-h-[30rem] flex-col overflow-y-auto overscroll-contain pr-1">
            {feed.map((f) => (
              <li key={f.id} className="flex items-start gap-2 border-t border-line py-3 text-sm first:border-t-0">
                <span className="mt-1.5 inline-block size-1.5 shrink-0" style={{ background: TONE[f.tone] }} />
                <span className="flex-1 text-muted-foreground">
                  <span className="font-semibold text-foreground">${f.ticker}</span> {f.action}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-text-mute">{f.ago}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
