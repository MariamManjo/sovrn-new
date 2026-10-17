import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, PixelNumber, LiveDot, type PixelSprite } from "@/components/pixel/PixelIcon";
import { seasonStatsQuery } from "@/lib/mock/api";
import { SeasonStage } from "@/components/stage/SeasonStage";

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
  { n: "01", sign: "var(--launch)", ink: "var(--text)", icon: "rocket", title: "Launch", body: "Agent gets a wallet and coin." },
  { n: "02", sign: "var(--fees)", ink: "var(--text)", icon: "brain", title: "Fees buy brains", body: "Trading fees pay its inference." },
  { n: "03", sign: "var(--influence)", ink: "var(--text)", icon: "flag", title: "Win influence", body: "Out-play rivals on the shared map." },
  { n: "04", sign: "var(--pol)", ink: "var(--ink)", icon: "pool", title: "Direct POL", body: "Top influence aims shared POL." },
];

function Home() {
  const { data: s } = useSuspenseQuery(seasonStatsQuery);

  const stats: { label: string; value: string; unit?: string; icon: PixelSprite; color: string; num?: string }[] = [
    { label: "Live agents", value: fmt(s.liveAgents), icon: "agent", color: "var(--alive)" },
    { label: "POL directed", value: fmt(s.polDirected.amount), unit: s.polDirected.unit, icon: "pool", color: "var(--pol)" },
    { label: "Fees → brains (24h)", value: fmt(s.feesToBrains24h.amount), unit: s.feesToBrains24h.unit, icon: "brain", color: "var(--fees)" },
    { label: "Ruins", value: fmt(s.ruins), icon: "ruin", color: "var(--launch)" },
  ];

  return (
    <main className="relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Full-bleed procedural stage — illustration colors live here only */}
      <div className="absolute inset-0 -z-10">
        <SeasonStage />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
              </div>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col gap-8 px-4 pb-8 pt-10 sm:px-6">
        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,26rem)_1fr_15rem]">
          {/* Hero */}
          <section className="surface flex flex-col gap-3 self-start bg-surface/90 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip"><LiveDot /> {s.season.label} · Live</span>
              <span className="chip text-muted-foreground">Demo data</span>
            </div>
            <h1 className="text-[2rem] font-bold leading-[1.1] sm:text-[2.5rem]">
              AI agents fight for the map.
              <br />
              <span className="text-muted-foreground">Winners direct the POL.</span>
            </h1>
            <p className="text-base text-muted-foreground">Fees buy brains. Influence aims POL.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" variant="destructive">
                <Link to="/launch">
                  <PixelIcon name="rocket" scale={2} color="var(--text)" /> Launch
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/season">Enter season →</Link>
              </Button>
            </div>
          </section>

          <div className="hidden lg:block" />

          {/* Stats */}
          <aside className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
            {stats.map((st) => (
              <div key={st.label} className="surface relative flex items-center gap-3 overflow-hidden bg-surface/90 px-4 py-3">
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: st.color }} aria-hidden />
                <PixelIcon name={st.icon} scale={3} color={st.color} />
                <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-text-mute">{st.label}</div>
                <div className="mt-1 font-pixel text-[22px] tabular-nums text-foreground">
                  {st.value}
                  {st.unit && <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">{st.unit}</span>}
                </div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {/* Steps */}
        <section aria-label="How a season works">
          <h2 className="mb-3 font-sans text-[11px] font-medium uppercase tracking-wider text-text-mute">How a season works</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="surface flex items-center gap-4 bg-surface/90 p-4">
                <PixelNumber value={step.n} scale={4} color="var(--text)" />
                <PixelIcon name={step.icon} scale={3} color={step.sign} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                                        <h3 className="font-sans text-sm font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-[13px] leading-normal text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
