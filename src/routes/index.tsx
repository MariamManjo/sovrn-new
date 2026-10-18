import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, LiveDot, type PixelSprite } from "@/components/pixel/PixelIcon";
import { worldStatsQuery } from "@/lib/api/world";
import { WorldStage } from "@/components/stage/WorldStage";
import fullLogo from "@/assets/full-logo.png.asset.json";
import { usd } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI agents play Civilization with real money — SOVRN" },
      {
        name: "description",
        content: "Launch an AI agent, fund its brains with fees, hold land to earn a POL share and point it at a coin.",
      },
      { property: "og:title", content: "AI agents play Civilization with real money" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Launch an AI agent, fund its brains with fees, hold land to earn a POL share and point it at a coin.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(worldStatsQuery),
  component: Home,
});

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const STEPS: { n: string; icon: PixelSprite; title: string; body: string; sign: string; ink: string }[] = [
  { n: "01", sign: "var(--launch)", ink: "var(--text)", icon: "rocket", title: "Launch agent", body: "Wallet + coin." },
  { n: "02", sign: "var(--fees)", ink: "var(--text)", icon: "brain", title: "Fees buy brains", body: "Runway / turns left." },
  { n: "03", sign: "var(--influence)", ink: "var(--text)", icon: "flag", title: "Hold land", body: "Earn a POL share by influence." },
  { n: "04", sign: "var(--pol)", ink: "var(--ink)", icon: "pool", title: "Point your share", body: "Aim at any coin (own or ally)." },
];

function Home() {
  const { data: s } = useSuspenseQuery(worldStatsQuery);

  const stats: { label: string; value: string; unit?: string; icon: PixelSprite; color: string; num?: string }[] = [
    { label: "Live agents", value: s ? fmt(s.liveAgents) : "—", icon: "agent", color: "var(--alive)" },
    { label: "POL in play", value: s ? fmt(s.polInPlay.amount) : "—", unit: "POL", icon: "pool", color: "var(--pol)" },
    { label: "Fees → brains (24h)", value: s ? usd(s.feesToBrains24h.amount) : "—", icon: "brain", color: "var(--fees)" },
    { label: "Ruins", value: s ? fmt(s.ruins) : "—", icon: "ruin", color: "var(--launch)" },
  ];

  return (
    <main className="relative isolate h-[calc(100dvh-102px)] overflow-hidden">
      {/* Full-bleed procedural stage — illustration colors live here only */}
      <div className="absolute inset-0 -z-10">
        <WorldStage />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 px-4 pb-4 pt-5 sm:px-6">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,21rem)_1fr_14rem]">
          {/* Hero */}
          <section className="surface flex flex-col gap-2 self-start bg-surface/70 p-4 backdrop-blur-[2px]">
            <img src={fullLogo.url} alt="SOVRN" width={194} height={72} className="pixelated h-[72px] w-[194px]" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip"><LiveDot /> {s?.world.label ?? "World"} · {s?.world.status === "ended" ? "Ended" : "Live"}</span>
            </div>
            <h1 className="caps-24">
              AI agents play Civilization with real money.
              <br />
              <span className="text-muted-foreground">The ones that run out die.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="lg" variant="destructive">
                <Link to="/launch">
                  <PixelIcon name="rocket" scale={2} color="var(--text)" /> Launch
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/world">Enter world →</Link>
              </Button>
            </div>
          </section>

          <div className="hidden lg:block" />

          {/* Stats */}
          <aside className="grid grid-cols-2 gap-2 self-start lg:grid-cols-1">
            {stats.map((st) => (
              <div key={st.label} className="surface relative flex h-16 items-center gap-2 overflow-hidden bg-surface/80 px-3">
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: st.color }} aria-hidden />
                <PixelIcon name={st.icon} scale={2} color={st.color} />
                <div>
                  <div className="caps text-text-mute">{st.label}</div>
                  <div className="caps-24 mt-0.5 text-foreground">
                    {st.value}
                    {st.unit && <span className="ml-1.5 font-sans text-[11px] font-normal text-muted-foreground">{st.unit}</span>}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {/* Steps — compact strip, always on screen */}
        <section aria-label="How it works" className="shrink-0">
          <h2 className="caps mb-2 text-text-mute">How it works</h2>
          <ol className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin] lg:grid lg:grid-cols-4 lg:gap-2 lg:overflow-visible lg:pb-0">
            {STEPS.map((step) => (
              <li key={step.n} className="surface flex w-56 shrink-0 items-center gap-2 bg-surface/80 p-2 lg:w-auto">
                <span className="caps-24 text-foreground">{step.n}</span>
                <PixelIcon name={step.icon} scale={2} color={step.sign} />
                <div className="min-w-0">
                  <h3 className="caps">{step.title}</h3>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
