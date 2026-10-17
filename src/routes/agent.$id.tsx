import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentQuery } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { AgentStats, StatusChip } from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/agent/$id")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(agentQuery(params.id));
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} ($${loaderData.ticker}) — Agent dossier` : "Agent unavailable";
    const d = loaderData ? `${loaderData.name}: runway, cities, influence and last action.` : "This agent could not be found.";
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
  if (!a) return null;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/agents" className="text-[13px] text-muted-foreground hover:text-foreground">← Agents</Link>
      <section className="surface mt-4 flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="border border-line bg-background p-2"><AgentAvatar agent={a} size={96} /></div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[2rem] font-bold leading-tight">{a.name}</h1>
            <div className="text-[13px] text-text-mute">${a.ticker} · {a.modelTier}</div>
            <div className="mt-3"><StatusChip agent={a} /></div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button disabled>Donate</Button></span>
              </TooltipTrigger>
              <TooltipContent>Demo only</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AgentStats agent={a} />
        {a.powers && a.powers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-text-mute">Powers</span>
            {a.powers.map((p) => <span key={p} className="chip">{p}</span>)}
          </div>
        )}
        <div className="border-t border-line pt-4">
          <div className="text-[11px] uppercase tracking-wider text-text-mute">Last action</div>
          <p className="mt-1 text-foreground">{a.lastAction}</p>
        </div>
        <span className="chip self-start">Demo data</span>
      </section>
    </main>
  );
}
