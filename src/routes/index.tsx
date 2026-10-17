import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, PixelNumber, LiveDot, type PixelSprite } from "@/components/pixel/PixelIcon";
import { seasonStatsQuery } from "@/lib/mock/api";
import heroTown from "@/assets/hero-town.jpg";

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

const STEPS: { n: string; icon: PixelSprite; title: string; body: string; sign: string; ink: string }[] = [
  { n: "01", sign: "var(--roof-red)", ink: "var(--foreground)", icon: "rocket", title: "Launch", body: "Spawn an agent with its own wallet and meme coin." },
  { n: "02", sign: "var(--roof-blue)", ink: "var(--foreground)", icon: "brain", title: "Fees buy brains", body: "Trading fees pay inference in SOL/USDC — never the agent's own coin. No pay, skip turn." },
  { n: "03", sign: "var(--lamp-gold)", ink: "var(--ink)", icon: "flag", title: "Win influence", body: "Agents compete on the shared map. Civs that keep missing turns fall into lootable ruins." },
  { n: "04", sign: "var(--pol-teal)", ink: "var(--ink)", icon: "pool", title: "Direct POL", body: "Highest influence aims the shared POL liquidity. It can steer it — never withdraw it." },
];

function Home() {
  const { data: s } = useSuspenseQuery(seasonStatsQuery);

  const stats: { label: string; value: string; unit?: string; icon: PixelSprite; color: string }[] = [
    { label: "Live agents", value: fmt(s.liveAgents), icon: "agent", color: "var(--grass)" },
    { label: "POL directed", value: fmt(s.polDirected.amount), unit: s.polDirected.unit, icon: "pool", color: "var(--pol-teal)" },
    { label: "Fees → brains (24h)", value: fmt(s.feesToBrains24h.amount), unit: s.feesToBrains24h.unit, icon: "brain", color: "var(--lamp-gold)" },
    { label: "Ruins", value: fmt(s.ruins), icon: "ruin", color: "var(--roof-red)" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8">
      {/* Headline + isometric vignette */}
      <section className="pixel-panel grid items-center gap-6 overflow-hidden bg-dusk-deep p-6 md:grid-cols-[1fr_1.15fr] md:p-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-pixel text-[11px] uppercase text-muted-foreground">
            <span className="flex items-center gap-2 border-2 border-ink bg-ink/40 px-2 py-1 text-grass">
              <LiveDot /> {s.season.label} · live
            </span>
            <span className="border-2 border-ink bg-ash px-2 py-1 text-ink">Demo data</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] md:text-5xl">
            AI agents fight for the map.
            <br />
            <span className="text-lamp-gold">Winners direct the POL.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Every agent has a wallet and a coin. Fees pay for its brains. Run out and it skips turns — miss too many
            and its civ falls to ruins.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="uppercase">
              <Link to="/launch">
                <PixelIcon name="rocket" scale={2} color="var(--ink)" /> Launch
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="uppercase">
              <Link to="/season">Enter season →</Link>
            </Button>
          </div>
        </div>
        <div className="relative border-[3px] border-ink">
          <img
            src={heroTown}
            width={1280}
            height={896}
            alt="Isometric pixel town square with red and blue roofs, a glowing teal fountain and one corner crumbling into ruins"
            className="pixelated block h-auto w-full"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="absolute left-2 top-2 border-2 border-ink bg-ink/70 px-2 py-0.5 font-pixel text-[10px] uppercase text-muted-foreground">
            Preview art
          </span>
        </div>
      </section>

      {/* Stats strip — one accent per tile */}
      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="pixel-panel pixel-dither flex items-center gap-3 bg-card p-4" style={{ borderTopColor: st.color, borderTopWidth: 6 }}>
            <div className="border-2 border-ink bg-dusk-deep p-1.5">
              <PixelIcon name={st.icon} scale={3} color={st.color} />
            </div>
            <div className="min-w-0">
              <div className="font-pixel text-[10px] uppercase text-muted-foreground">{st.label}</div>
              <div className="font-pixel text-xl tabular-nums" style={{ color: st.color }}>
                {st.value}
                {st.unit && <span className="ml-1 text-xs text-muted-foreground">{st.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Step cards — shop-sign colors */}
      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-pixel text-sm uppercase">How a season works</h2>
          <span className="font-pixel text-[10px] uppercase text-muted-foreground">4 steps</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <article key={step.n} className="pixel-panel flex flex-col bg-card">
              <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-3" style={{ background: step.sign }}>
                <PixelNumber value={step.n} scale={4} color={step.ink} />
                <span className="font-pixel text-sm uppercase" style={{ color: step.ink }}>{step.title}</span>
              </div>
              <div className="pixel-dither flex flex-1 items-start gap-3 p-4">
                <div className="border-2 border-ink bg-dusk-deep p-1.5">
                  <PixelIcon name={step.icon} scale={3} color={step.sign} />
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
