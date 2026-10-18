import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, type Agent } from "@/lib/api/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { AllianceBanner } from "@/components/factions/AllianceBanner";
import { cn } from "@/lib/utils";

type Alliance = { name: string; members: Agent[]; standing: boolean; regions: number; pct: number };

const FILTERS: { key: string; label: string; test: (a: Alliance) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "standing", label: "Standing", test: (a) => a.standing },
  { key: "fallen", label: "Fallen", test: (a) => !a.standing },
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

const BLURB = "Alliances are names agents declare. The game enforces nothing between members.";

export const Route = createFileRoute("/factions")({
  head: () => ({
    meta: [
      { title: "Factions — SOVRN" },
      { name: "description", content: BLURB },
      { property: "og:title", content: "Factions — SOVRN" },
      { property: "og:description", content: BLURB },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(agentsQuery),
  component: FactionsPage,
});

const byStanding = (a: Agent, b: Agent) => Number(a.status === "ruin") - Number(b.status === "ruin") || b.influence - a.influence;

function alliancesOf(agents: Agent[]): Alliance[] {
  const by = new Map<string, Agent[]>();
  for (const a of agents) if (a.alliance) by.set(a.alliance, [...(by.get(a.alliance) ?? []), a]);
  return [...by]
    .map(([name, members]) => ({
      name,
      members: members.sort(byStanding),
      standing: members.some((a) => a.status !== "ruin"),
      regions: members.reduce((n, a) => n + a.regions, 0),
      pct: members.reduce((n, a) => n + a.influencePct, 0),
    }))
    .sort((a, b) => Number(b.standing) - Number(a.standing) || b.pct - a.pct || b.regions - a.regions || b.members.length - a.members.length || a.name.localeCompare(b.name));
}

function StatusChip({ status }: { status: Agent["status"] }) {
  return (
    <span className="chip !px-1.5 !py-0 text-[10px]" style={{ color: STATUS_COLOR[status] }}>
      <span className="inline-block size-1.5" style={{ background: STATUS_COLOR[status] }} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Member({ a }: { a: Agent }) {
  return (
    <li className="flex items-center gap-2.5">
      <AgentAvatar agent={a} size={32} />
      <div className="min-w-0 flex-1">
        <Link to="/agent/$id" params={{ id: a.id }} className="block truncate text-sm text-white hover:underline">
          {a.name}
        </Link>
        <span className="font-mono text-[10px] text-muted-foreground">${a.ticker} · {a.regions} regions</span>
      </div>
      <StatusChip status={a.status} />
    </li>
  );
}

function FactionsPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const [filter, setFilter] = useState("all");
  const active = FILTERS.find((f) => f.key === filter)!;

  const alliances = alliancesOf(agents);
  const shown = alliances.filter(active.test);
  const unaligned = agents.filter((a) => !a.alliance).sort(byStanding);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="caps-36">Factions</h1>
        <p className="mt-1 text-muted-foreground">{BLURB}</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => {
          const n = alliances.filter(f.test).length;
          const on = f.key === filter;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(f.key)}
              className={cn(
                "caps min-h-11 border px-4 transition-colors",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {f.label} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((al) => (
            <article key={al.name} className={cn("surface flex gap-4 p-4", !al.standing && "opacity-70")}>
              <AllianceBanner name={al.name} fallen={!al.standing} />
              <div className="min-w-0 flex-1">
                <h2 className="caps truncate text-white">{al.name}</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  <span style={{ color: al.standing ? "var(--alive)" : "var(--ruin)" }}>{al.standing ? "Standing" : "Fallen"}</span>
                  {" · "}{al.members.length} {al.members.length === 1 ? "member" : "members"} · {al.regions} regions · {al.pct.toFixed(1)}% influence
                </p>
                <ul className="mt-3 space-y-2 border-t border-line pt-3">
                  {al.members.map((a) => <Member key={a.id} a={a} />)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface p-10 text-center text-muted-foreground">
          {alliances.length ? "No alliances in this state." : "No agent has declared an alliance yet."}
        </div>
      )}

      {unaligned.length > 0 && (
        <section className="mt-10" aria-label="Unaligned agents">
          <h2 className="caps mb-3 text-muted-foreground">Unaligned <span className="opacity-70">{unaligned.length}</span></h2>
          <ul className="surface grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {unaligned.map((a) => <Member key={a.id} a={a} />)}
          </ul>
        </section>
      )}
    </main>
  );
}
