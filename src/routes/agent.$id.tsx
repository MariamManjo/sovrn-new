import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentQuery } from "@/lib/api/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { AgentStats, StatusChip, aimOf } from "@/components/agents/AgentCard";
import { MoneyPanel, type MoneyKind } from "@/components/agents/HumanActions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/agent/$id")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(agentQuery(params.id));
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} ($${loaderData.ticker}) — Agent dossier` : "Agent unavailable";
    const d = loaderData ? `${loaderData.name}: runway, regions, influence and last action.` : "This agent could not be found.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-muted-foreground">No agent with this id.</p>
      <Link to="/agents" className="mt-4 inline-block underline">Back to agents</Link>
    </main>
  ),
  component: Dossier,
});

function Dossier() {
  const { id } = Route.useParams();
  const { data: a } = useSuspenseQuery(agentQuery(id));
  const [money, setMoney] = useState<MoneyKind | null>(null);
  if (!a) return null;
  const aim = aimOf(a);
  const facts: { label: string; value: string }[] = [
    { label: "Archetype", value: a.archetype },
    { label: "Model", value: a.model },
    { label: "POL aim", value: aim ? `$${aim}` : "—" },
    { label: "Alliance", value: a.alliance ?? "None" },
    { label: "Joined", value: `Turn ${a.joinedTurn}` },
    { label: "Died", value: a.diedTurn === null ? "—" : `Turn ${a.diedTurn}` },
  ];
  const stock = [
    { label: "Food", value: a.stock.food, color: "var(--alive)" },
    { label: "Gold", value: a.stock.gold, color: "var(--gold)" },
    { label: "Materials", value: a.stock.materials, color: "var(--civ-earth)" },
    { label: "Commodities", value: a.stock.commodities, color: "var(--influence)" },
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/agents" className="text-[13px] text-muted-foreground hover:text-foreground">← Agents</Link>
      <section className="surface mt-4 flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <AgentAvatar agent={a} size={96} ring />
          <div className="min-w-0 flex-1">
            <h1 className="caps-36">{a.name}</h1>
            <div className="text-[13px] text-text-mute">${a.ticker} · {a.modelTier}</div>
            <div className="mt-3"><StatusChip agent={a} /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" aria-pressed={money === "buy"} onClick={() => setMoney(money === "buy" ? null : "buy")}>Buy ${a.ticker}</Button>
            <Button disabled={a.status === "ruin"} title={a.status === "ruin" ? "The dead take no donations" : undefined}
              aria-pressed={money === "donate"} onClick={() => setMoney(money === "donate" ? null : "donate")}>Donate</Button>
          </div>
        </div>
        {money && <MoneyPanel key={money} agent={a} kind={money} onClose={() => setMoney(null)} />}
        {a.persona && <p className="text-[13px] text-muted-foreground">“{a.persona}”</p>}
        <AgentStats agent={a} />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="caps text-text-mute">{f.label}</dt>
              <dd className="truncate text-foreground" title={f.value}>{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          <span className="caps text-text-mute">Stock</span>
          {stock.map((r) => (
            <span key={r.label} className="chip text-muted-foreground">
              <span className="inline-block size-2" style={{ background: r.color }} aria-hidden />
              {r.label} <span className="font-mono tabular-nums text-foreground">{r.value}</span>
            </span>
          ))}
        </div>
        {a.powers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="caps text-text-mute">Techs</span>
            {a.powers.map((p) => <span key={p} className="chip">{p}</span>)}
          </div>
        )}
        <div className="border-t border-line pt-4">
          <div className="caps text-text-mute">Last action</div>
          <p className="mt-1 text-foreground">{a.lastAction}</p>
        </div>
        {a.notes && (
          <div className="border-t border-line pt-4">
            <div className="caps text-text-mute">Latest notes</div>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-muted-foreground">{a.notes}</p>
          </div>
        )}
      </section>
    </main>
  );
}
