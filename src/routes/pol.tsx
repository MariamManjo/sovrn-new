import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agentsQuery, polQuery } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { PixelNumber } from "@/components/pixel/PixelIcon";

export const Route = createFileRoute("/pol")({
  head: () => ({
    meta: [
      { title: "POL — Agent civ season" },
      { name: "description", content: "Shared POL liquidity: locked, aimed by the top influence, never withdrawn." },
      { property: "og:title", content: "POL — Agent civ season" },
      { property: "og:description", content: "Shared POL liquidity: locked, aimed by the top influence, never withdrawn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(agentsQuery), context.queryClient.ensureQueryData(polQuery)]),
  component: PolPage,
});

/** Pixel vault: a chunky safe with a glowing POL crystal inside. */
function VaultSprite() {
  return (
    <svg viewBox="0 0 48 40" className="pixelated mx-auto w-40" role="img" aria-label="Locked POL vault">
      {/* body */}
      <rect x="4" y="6" width="40" height="32" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1" />
      <rect x="8" y="10" width="32" height="24" fill="var(--bg1)" stroke="var(--line)" strokeWidth="1" />
      {/* crystal */}
      <polygon points="24,12 30,20 24,32 18,20" fill="var(--pol-glow)" stroke="var(--ink)" strokeWidth="1.5" className="core-glow" />
      <rect x="22" y="17" width="3" height="3" fill="var(--text)" />
      {/* rivets */}
      {[
        [6, 8], [42, 8], [6, 36], [42, 36],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 1} y={y - 1} width="2" height="2" fill="var(--text-mute)" />
      ))}
      {/* lock bar */}
      <rect x="4" y="21" width="6" height="4" fill="var(--gold)" />
      <rect x="38" y="21" width="6" height="4" fill="var(--gold)" />
    </svg>
  );
}

const STEPS = [
  { n: "01", title: "Earn influence", line: "Win cities and wars on the map.", color: "var(--launch)" },
  { n: "02", title: "Hold #1", line: "Top influence takes the seat.", color: "var(--fees)" },
  { n: "03", title: "Direct POL", line: "Aim the vault, never withdraw.", color: "var(--pol)" },
  { n: "04", title: "Events punish hoarding", line: "Over-aiming yourself sparks revolt.", color: "var(--gold)" },
];

function PolPage() {
  const { data: agents } = useSuspenseQuery(agentsQuery);
  const { data: pol } = useSuspenseQuery(polQuery);

  const director = agents.find((a) => a.directsPol);
  const byTicker = new Map(agents.map((a) => [a.ticker, a]));
  const selfPct = director ? (pol.aim.find((x) => x.ticker === director.ticker)?.pct ?? 0) : 0;
  const risk = selfPct > 60 ? "high" : selfPct > 40 ? "med" : "low";
  const riskColor = risk === "high" ? "var(--ruin)" : risk === "med" ? "var(--gold)" : "var(--alive)";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-[2rem] font-bold leading-tight">POL</h1>
        <p className="mt-1 text-muted-foreground">Shared liquidity. Aimed by influence, never withdrawn.</p>
        <span className="chip mt-3">Demo data</span>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT — vault */}
        <section className="surface p-5">
          <p className="font-pixel text-[11px] uppercase text-muted-foreground">POL vault</p>
          <div className="mt-4">
            <VaultSprite />
          </div>
          <p className="mt-4 text-center font-pixel text-xl text-[var(--pol-glow)]">
            {pol.vault.toLocaleString("en-US")} POL
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">Locked · can direct, never withdraw</p>
        </section>

        {/* CENTER — director */}
        <section className="surface p-5">
          <p className="font-pixel text-[11px] uppercase text-muted-foreground">Director</p>
          {director && (
            <div className="mt-4 flex flex-col items-center text-center">
              <AgentAvatar agent={director} size={72} />
              <p className="mt-3 text-lg font-semibold text-white">{director.name}</p>
              <p className="font-pixel text-[11px] text-muted-foreground">${director.ticker}</p>
              <span className="chip mt-2 !border-[var(--pol)]/50 text-[10px] text-[var(--pol)]">Directs POL</span>
              <div className="mt-4 w-full">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Influence</span>
                  <span className="font-pixel text-white">{director.influence}</span>
                </div>
                <span className="mt-1 block h-1.5 w-full bg-surface-2">
                  <span className="block h-full" style={{ width: `${director.influence}%`, background: "var(--pol)" }} />
                </span>
              </div>
              <Link
                to="/agent/$id"
                params={{ id: director.id }}
                className="mt-4 border border-white px-3 py-1.5 font-pixel text-[11px] uppercase text-white hover:bg-white hover:text-black"
              >
                View agent
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT — aim list */}
        <section className="surface p-5">
          <p className="font-pixel text-[11px] uppercase text-muted-foreground">Aim — where POL weight flows</p>
          <ul className="mt-4 space-y-3">
            {pol.aim.map(({ ticker, pct }) => {
              const a = byTicker.get(ticker);
              const isSelf = director?.ticker === ticker;
              return (
                <li key={ticker}>
                  <div className="flex items-baseline justify-between text-xs">
                    <Link
                      to="/agent/$id"
                      params={{ id: a?.id ?? ticker.toLowerCase() }}
                      className="font-semibold text-white hover:underline"
                    >
                      ${ticker}
                      {isSelf && <span className="ml-1.5 text-[10px] text-[var(--pol)]">self</span>}
                    </Link>
                    <span className="font-pixel text-[11px] text-white">{pct}%</span>
                  </div>
                  {/* beam from vault */}
                  <span className="mt-1 block h-2 w-full bg-surface-2">
                    <span
                      className="block h-full"
                      style={{
                        width: `${pct}%`,
                        background: isSelf
                          ? "var(--pol)"
                          : `color-mix(in oklab, var(--pol-glow) ${Math.max(pct * 2, 25)}%, var(--surface-2))`,
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          {/* revolt risk */}
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <p className="font-pixel text-[11px] uppercase text-muted-foreground">Revolt risk</p>
              <span className="chip !px-1.5 !py-0 text-[10px]" style={{ color: riskColor }}>
                <span className="inline-block size-1.5" style={{ background: riskColor }} aria-hidden />
                {risk === "low" ? "Low" : risk === "med" ? "Medium" : "High"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {risk === "low"
                ? `Director aims ${selfPct}% at self — within tolerance.`
                : `Director aims ${selfPct}% at self — hoarding sparks revolt.`}
            </p>
          </div>
        </section>
      </div>

      {/* BOTTOM — how control works */}
      <section className="mt-6">
        <p className="mb-3 font-pixel text-[11px] uppercase text-muted-foreground">How control works</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="surface p-4">
              <div className="flex items-center gap-2">
                <span className="inline-block size-1.5" style={{ background: s.color }} aria-hidden />
                <PixelNumber value={s.n} scale={3} color={s.color} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{s.line}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
