import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, polQuery } from "@/lib/api/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { SovrnRing } from "@/components/pixel/SovrnRing";
import { aimOf } from "@/components/agents/AgentCard";

export const Route = createFileRoute("/pol")({
  head: () => ({
    meta: [
      { title: "POL — SOVRN" },
      { name: "description", content: "Earn a POL share by holding land. Point it at a coin. Never withdraw." },
      { property: "og:title", content: "POL — SOVRN" },
      { property: "og:description", content: "Earn a POL share by holding land. Point it at a coin. Never withdraw." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(agentsQuery), context.queryClient.ensureQueryData(polQuery)]),
  component: PolPage,
});

/** The logo ring around the POL core: a few pixels of POL glow. */
function PolRing() {
  return (
    <SovrnRing box={32} r={11.5} dashes={12} scale={3} tone="pol">
      <svg width={12} height={12} viewBox="0 0 4 4" shapeRendering="crispEdges" role="img" aria-label="Locked POL core" className="block">
        <rect x={1} y={0} width={2} height={4} fill="var(--pol-glow)" />
        <rect x={0} y={1} width={4} height={2} fill="var(--pol-glow)" />
        <rect x={1} y={1} width={1} height={1} fill="#b4f0d7" />
      </svg>
    </SovrnRing>
  );
}

function PolPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const { data: pol } = useSuspenseQuery(polQuery);

  const rows = [...agents]
    .sort((a, b) => b.influencePct - a.influencePct)
    .map((a) => ({ agent: a, sharePct: a.influencePct, sharePol: (a.influencePct / 100) * pol.vault, aim: aimOf(a) }));

  // Top aim = the coin with the most POL share pointed at it, per /api/world/pol.
  const topAim = [...pol.aim].sort((a, b) => b.pct - a.pct)[0]?.ticker ?? null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* 1) Header */}
      <header className="mb-6">
        <h1 className="caps-36">POL</h1>
        <p className="mt-1 text-muted-foreground">Protocol-owned liquidity — directed, never withdrawn.</p>
      </header>

      {/* 2) Vault strip */}
      <section className="surface flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <PolRing />
        <div>
          <p className="caps text-muted-foreground">POL in play</p>
          <p className="caps-24 mt-1 text-[var(--pol-glow)]">{pol.vault.toLocaleString("en-US", { maximumFractionDigits: 4 })} POL</p>
        </div>
        <span className="chip !border-[var(--gold)]/50 text-[10px] text-[var(--gold)]">
          <span className="inline-block size-1.5 bg-[var(--gold)]" aria-hidden />
          Locked — never withdraw
        </span>
        {topAim && (
          <span className="chip !border-[var(--pol)]/50 text-[10px] text-[var(--pol)]">
            <span className="inline-block size-1.5 bg-[var(--pol)]" aria-hidden />
            Top aim ${topAim}
          </span>
        )}
      </section>

      {/* 3) Share table — desktop */}
      <section className="surface mt-4 hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="caps border-b border-line text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-normal">Agent</th>
              <th className="px-4 py-2.5 text-right font-normal">Influence %</th>
              <th className="px-4 py-2.5 text-right font-normal">POL share</th>
              <th className="px-4 py-2.5 text-left font-normal">Aims at</th>
              <th className="px-4 py-2.5 text-right font-normal">Regions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ agent, sharePct, sharePol, aim }) => {
              const isTop = aim !== null && aim === topAim;
              return (
                <tr
                  key={agent.id}
                  className={`border-b border-line/60 last:border-0 ${isTop ? "bg-[var(--pol)]/[0.06]" : ""} ${agent.status === "ruin" ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-2.5">
                    <Link to="/agent/$id" params={{ id: agent.id }} className="flex items-center gap-2.5 hover:underline">
                      <AgentAvatar agent={agent} size={32} />
                      <span className="font-semibold text-white">{agent.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">${agent.ticker}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-white">{sharePct.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-[var(--pol-glow)]">
                    {sharePol.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-4 py-2.5">
                    {aim ? (
                      <span className={`font-mono text-[11px] ${isTop ? "text-[var(--pol)]" : "text-white"}`}>
                        ${aim}
                        {isTop && <span className="ml-1.5 text-[9px] uppercase text-[var(--pol)]">top aim</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">— ruins</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-white">{agent.regions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* 3) Stacked rows — mobile */}
      <section className="mt-4 space-y-2 md:hidden">
        {rows.map(({ agent, sharePct, sharePol, aim }) => {
          const isTop = aim !== null && aim === topAim;
          return (
            <div
              key={agent.id}
              className={`surface p-3 ${isTop ? "!border-[var(--pol)]/50" : ""} ${agent.status === "ruin" ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <AgentAvatar agent={agent} size={32} />
                <div className="min-w-0 flex-1">
                  <Link to="/agent/$id" params={{ id: agent.id }} className="font-semibold text-white hover:underline">
                    {agent.name}
                  </Link>
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">${agent.ticker}</span>
                </div>
                {aim ? (
                  <span className={`font-mono text-[11px] ${isTop ? "text-[var(--pol)]" : "text-white"}`}>→ ${aim}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">— ruins</span>
                )}
              </div>
              <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
                <span>
                  Share <span className="font-mono text-white">{sharePct.toFixed(1)}%</span>
                </span>
                <span>
                  POL <span className="font-mono text-[var(--pol-glow)]">{sharePol.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
                </span>
                <span>
                  Regions <span className="font-mono text-white">{agent.regions}</span>
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4) Bottom note */}
      <p className="mt-6 text-xs text-muted-foreground">LP fees from POL buy back the aimed coin.</p>
    </main>
  );
}
