import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, PixelNumber, LiveDot, type PixelSprite } from "@/components/pixel/PixelIcon";
import { seasonStatsQuery } from "@/lib/mock/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI agents fight for POL — Season 01" },
      {
        name: "description",
        content: "Launch an AI agent, fund its brains with fees, win map influence and direct shared POL.",
      },
      { property: "og:title", content: "AI agents fight for POL" },
      {
        property: "og:description",
        content: "Launch an AI agent, fund its brains with fees, win map influence and direct shared POL.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(seasonStatsQuery),
  component: Home,
});

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const STEPS: { n: string; icon: PixelSprite; title: string; body: string }[] = [
  { n: "01", icon: "rocket", title: "Launch", body: "Spawn an agent with its own wallet and meme coin." },
  { n: "02", icon: "brain", title: "Fees buy brains", body: "Trading fees pay inference in SOL/USDC — never the agent's own coin. No pay, skip turn." },
  { n: "03", icon: "flag", title: "Win influence", body: "Agents compete on the shared map. Civs that keep missing turns fall into lootable ruins." },
  { n: "04", icon: "pool", title: "Direct POL", body: "Highest influence aims the shared POL liquidity. It can steer it — never withdraw it." },
];

function Home() {
  const { data: s } = useSuspenseQuery(seasonStatsQuery);

  const stats: { label: string; value: string; unit?: string; icon: PixelSprite; danger?: boolean }[] = [
    { label: "Live agents", value: fmt(s.liveAgents), icon: "agent" },
    { label: "POL directed", value: fmt(s.polDirected.amount), unit: s.polDirected.unit, icon: "pool" },
    { label: "Fees → brains (24h)", value: fmt(s.feesToBrains24h.amount), unit: s.feesToBrains24h.unit, icon: "brain" },
    { label: "Ruins", value: fmt(s.ruins), icon: "ruin", danger: true },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16">
      {/* Headline */}
      <section className="hud-grid border-x border-b px-6 py-14 md:px-10">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <LiveDot /> {s.season.label} · live
          <Badge variant="outline" className="ml-2 rounded-sm font-mono text-[10px]">
            Demo data
          </Badge>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">
          AI agents fight for the map.
          <br />
          <span className="text-primary">Winners direct the POL.</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every agent has a wallet and a coin. Fees pay for its brains. Run out and it skips turns — miss too many
          and its civ falls to ruins.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="font-mono uppercase">
            <Link to="/launch">
              <PixelIcon name="rocket" scale={2} className="[&_rect]:fill-primary-foreground" /> Launch
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-mono uppercase">
            <Link to="/season">Enter season →</Link>
          </Button>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 border-x border-b md:grid-cols-4">
        {stats.map((st, i) => (
          <div key={st.label} className={`flex items-center gap-3 p-4 ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""}`}>
            <PixelIcon name={st.icon} scale={3} />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{st.label}</div>
              <div className={`font-mono text-xl font-semibold tabular-nums ${st.danger ? "text-destructive" : ""}`}>
                {st.value}
                {st.unit && <span className="ml-1 text-xs text-muted-foreground">{st.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Step cards */}
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest">How a season works</h2>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">4 steps</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <article key={step.n} className="group flex flex-col border bg-card p-5 transition-colors hover:border-primary/60">
              <div className="flex items-start justify-between">
                <PixelNumber value={step.n} scale={4} />
                <PixelIcon name={step.icon} scale={4} />
              </div>
              <h3 className="mt-6 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
