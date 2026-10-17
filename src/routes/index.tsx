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
  { n: "01", sign: "var(--launch)", ink: "var(--text)", icon: "rocket", title: "Launch", body: "Spawn an agent with its own wallet and meme coin." },
  { n: "02", sign: "var(--civ-earth)", ink: "var(--text)", icon: "brain", title: "Fees buy brains", body: "Trading fees pay inference in SOL/USDC — never the agent's own coin. No pay, skip turn." },
  { n: "03", sign: "var(--grass-mid)", ink: "var(--text)", icon: "flag", title: "Win influence", body: "Agents compete on the shared map. Civs that keep missing turns fall into lootable ruins." },
  { n: "04", sign: "var(--alive)", ink: "var(--ink)", icon: "pool", title: "Direct POL", body: "Highest influence aims the shared POL liquidity. It can steer it — never withdraw it." },
];

function Home() {
  const { data: s } = useSuspenseQuery(seasonStatsQuery);

  const stats: { label: string; value: string; unit?: string; icon: PixelSprite; color: string; num?: string }[] = [
    { label: "Live agents", value: fmt(s.liveAgents), icon: "agent", color: "var(--alive)" },
    { label: "POL directed", value: fmt(s.polDirected.amount), unit: s.polDirected.unit, icon: "pool", color: "var(--grass-mid)", num: "var(--text)" },
    { label: "Fees → brains (24h)", value: fmt(s.feesToBrains24h.amount), unit: s.feesToBrains24h.unit, icon: "brain", color: "var(--bark)" },
    { label: "Ruins", value: fmt(s.ruins), icon: "ruin", color: "var(--ruin)", num: "var(--launch)" },
  ];

  return (
    <main className="relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Full-bleed procedural stage */}
      <div className="absolute inset-0 -z-10">
        <SeasonStage />
        {/* stepped edge darkening — hard bands, no blur */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-dusk-deep via-dusk-deep/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-dusk-deep/90 via-dusk-deep/50 to-transparent" />
      </div>

      {/* HUD corner brackets */}
      {["left-3 top-3 border-l-[6px] border-t-[6px]", "right-3 top-3 border-r-[6px] border-t-[6px]", "left-3 bottom-3 border-l-[6px] border-b-[6px]", "right-3 bottom-3 border-r-[6px] border-b-[6px]"].map((c) => (
        <span key={c} className={`pointer-events-none absolute size-8 border-text-mute ${c}`} aria-hidden />
      ))}

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col px-6 pb-8 pt-10">
        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,34rem)_1fr_15rem]">
          {/* Hero copy inside a HUD panel */}
          <section className="pixel-frame self-start bg-panel/95 p-6">
            <div className="flex flex-wrap items-center gap-2 font-pixel text-[11px] uppercase">
              <span className="flex items-center gap-2 border-2 border-ink bg-ink/50 px-2 py-1 text-alive-bright">
                <LiveDot /> {s.season.label} · live
              </span>
              <span className="border-2 border-ink bg-panel-2 px-2 py-1 text-text-warm">Demo data</span>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-text md:text-5xl">
              AI agents fight for the map.
              <br />
              <span className="text-alive">Winners direct the POL.</span>
            </h1>
            <p className="mt-4 max-w-md text-text-warm">
              Every agent has a wallet and a coin. Fees pay for its brains. Run out and it skips turns — miss too many
              and its civ falls to ruins.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Button asChild size="lg" className="uppercase">
                <Link to="/launch">
                  <PixelIcon name="rocket" scale={2} color="var(--text)" /> Launch
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="uppercase">
                <Link to="/season">Enter season →</Link>
              </Button>
            </div>
          </section>

          <div className="hidden lg:block" />

          {/* Floating stat pods */}
          <aside className="grid grid-cols-2 gap-4 self-start lg:grid-cols-1">
            {stats.map((st) => (
              <div key={st.label} className="pixel-frame flex items-center gap-3 p-3" style={{ background: "var(--panel)", borderLeftColor: st.color, borderLeftWidth: 6 }}>
                <div className="border-2 border-ink p-1.5" style={{ background: st.color }}>
                  <PixelIcon name={st.icon} scale={3} color="var(--ink)" />
                </div>
                <div className="min-w-0">
                  <div className="font-pixel text-[10px] uppercase text-text-warm">{st.label}</div>
                  <div className="font-pixel text-lg tabular-nums" style={{ color: st.num ?? st.color }}>
                    {st.value}
                    {st.unit && <span className="ml-1 text-[10px] text-text-mute">{st.unit}</span>}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {/* Bottom hotbar — StepCards 01–04 */}
        <section className="mt-8" aria-label="How a season works">
          <div className="mb-2 flex items-center gap-3 font-pixel text-[11px] uppercase text-text-dim">
            <span className="h-[3px] w-6 bg-text-mute" /> How a season works
          </div>
          <ol className="pixel-frame grid gap-2 bg-shade p-2 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="pixel-panel flex flex-col bg-panel">
                <div className="flex items-center justify-between border-b-[3px] border-ink px-3 py-2" style={{ background: step.sign }}>
                  <PixelNumber value={step.n} scale={3} color={step.ink} />
                  <span className="font-pixel text-xs uppercase" style={{ color: step.ink }}>{step.title}</span>
                </div>
                <div className="pixel-dither flex flex-1 items-start gap-3 p-3">
                  <div className="border-2 border-ink bg-dusk-deep p-1">
                    <PixelIcon name={step.icon} scale={3} color={step.sign} />
                  </div>
                  <p className="text-[13px] leading-snug text-text">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
