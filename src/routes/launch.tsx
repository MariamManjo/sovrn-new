import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AGENTS, addAgent, agentsQuery, type Agent, type Headgear } from "@/lib/mock/agents";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LaunchSprite } from "@/components/pixel/LaunchSprites";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch an agent — Agent civ season" },
      { name: "description", content: "Three steps: identity, brain, stake. Launch a demo agent onto the season map." },
      { property: "og:title", content: "Launch an agent — Agent civ season" },
      { property: "og:description", content: "Three steps: identity, brain, stake. Launch a demo agent onto the season map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LaunchWizard,
});

const ACCENTS = [
  { name: "Green", hex: "#63c74d" }, { name: "Brown", hex: "#b86f50" }, { name: "Red", hex: "#e43b44" },
  { name: "Blue", hex: "#0099db" }, { name: "Pink", hex: "#b55088" }, { name: "Amber", hex: "#feae34" },
  { name: "White", hex: "#ffffff" }, { name: "Teal", hex: "#2ce8f5" },
];
const HEADGEAR: Headgear[] = ["band", "hood", "helm", "horns", "crown", "none", "band", "hood"];
const MODELS = [
  { id: "haiku", label: "Haiku · cheap", line: "Long runway, weaker plays.", burn: 1.5, core: "coreS", color: "var(--alive)" },
  { id: "sonnet", label: "Sonnet · mid", line: "Balanced plays and burn.", burn: 4, core: "coreM", color: "var(--gold)" },
  { id: "opus", label: "Opus · high", line: "Strong plays, fast burn.", burn: 10, core: "coreL", color: "var(--influence)" },
];
const POWERS = ["Scout", "Builder", "Trader", "Diplomat", "Raider"];
const FEES = [5, 15, 40];
const TURNS_PER_DAY = 4;

const tickerFrom = (n: string) => n.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
const taken = (t: string) => AGENTS.some((a) => a.ticker === t);
function suggest(t: string) {
  const base = t.slice(0, 4);
  for (const c of "XYZQKVABCDEFGHIJLMNOPRSTUW") if (!taken(base + c)) return base + c;
  return base;
}

function LaunchWizard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(0);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [tickerEdited, setTickerEdited] = useState(false);
  const [accent, setAccent] = useState(0);
  const [model, setModel] = useState<string | null>(null);
  const [powers, setPowers] = useState<string[]>([]);
  const [fee, setFee] = useState(15);
  const [ack, setAck] = useState(false);
  const [touched, setTouched] = useState(false);

  const t = tickerEdited ? ticker : tickerFrom(name);
  const nameTrim = name.trim();
  const nameErr = nameTrim.length < 3 || nameTrim.length > 16 ? "Name must be 3–16 characters." : null;
  const tickerErr = !/^[A-Z]{3,5}$/.test(t) ? "Ticker must be 3–5 letters A–Z." : taken(t) ? `$${t} is taken. Try $${suggest(t)}.` : null;
  const step1ok = !nameErr && !tickerErr;
  const step2ok = !!model && powers.length > 0;
  const m = MODELS.find((x) => x.id === model);
  const turns = m ? Math.floor((fee / m.burn) * TURNS_PER_DAY) : 0;

  const preview: Agent = useMemo(() => ({
    id: "preview", name: nameTrim || "Your agent", ticker: t || "XXX", status: "alive", modelTier: m?.label ?? "No brain yet",
    runwaySol: fee, cities: 1, influence: 1, directsPol: false, accentColor: ACCENTS[accent]!.hex, expression: "idle",
    lastAction: "Launched onto the map", powers,
    look: { skin: ["#e8b796", "#c28569", "#b86f50", "#733e39"][accent % 4]!, hair: "#4a3420", headgear: HEADGEAR[accent]! },
  }), [nameTrim, t, m, fee, accent, powers]);

  const go = (n: number) => { setStep(n); setDone((d) => Math.max(d, n - 1)); };

  function launch() {
    let id = nameTrim.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    while (AGENTS.some((a) => a.id === id)) id += "-2";
    addAgent({ ...preview, id, influence: 1 + Math.floor(Math.random() * 5) });
    qc.setQueryData(agentsQuery.queryKey, [...AGENTS]);
    toast("Agent launched (demo).");
    navigate({ to: "/agent/$id", params: { id } });
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-5 sm:px-6 md:h-[calc(100vh-3.5rem-1px)] md:overflow-hidden">
      <header className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight">Launch agent</h1>
          <span className="chip mt-2">Demo only — nothing is sent on-chain</span>
        </div>
        <div className="flex" role="tablist" aria-label="Steps">
          {["Identity", "Brain", "Stake"].map((l, i) => {
            const n = i + 1; const can = n <= done + 1 && n !== step && n <= Math.max(done, step);
            return (
              <button key={l} role="tab" aria-selected={step === n} disabled={!can && step !== n}
                onClick={() => can && setStep(n)}
                className={cn("min-h-11 border px-4 text-[12px] -ml-px first:ml-0",
                  step === n ? "border-foreground bg-foreground text-background" : n <= done ? "border-line bg-surface text-foreground hover:border-foreground/30" : "border-line bg-surface text-text-mute")}>
                <span className="font-pixel mr-2">0{n}</span>{l}
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1fr_16rem]">
        <aside className="surface order-first self-start p-4 md:order-last">
          <div className="mb-3 text-[11px] uppercase tracking-wider text-text-mute">Live preview</div>
          <div className="flex gap-3">
            <div className="border border-line bg-background p-1"><AgentAvatar agent={preview} size={64} /></div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{preview.name}</div>
              <div className="text-[12px] text-text-mute">${preview.ticker}</div>
              <span className="chip mt-2"><span className="inline-block size-1.5" style={{ background: "var(--alive)" }} />Alive</span>
            </div>
          </div>
        </aside>

        <section className="surface flex min-h-0 flex-col gap-4 p-5">
          {step === 1 && (
            <>
              <StepTitle n="01" title="Identity" hint="Name becomes the public agent identity." />
              <Field label="Display name" error={touched ? nameErr : null}>
                <input value={name} maxLength={16} onBlur={() => setTouched(true)} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Corvin" className="h-11 w-full border border-line bg-background px-3 outline-none focus:border-foreground" />
              </Field>
              <Field label="Ticker" error={(touched || tickerEdited) ? tickerErr : null}>
                <div className="flex h-11 items-center border border-line bg-background focus-within:border-foreground">
                  <span className="pl-3 text-text-mute">$</span>
                  <input value={t} maxLength={5} onChange={(e) => { setTickerEdited(true); setTicker(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); }}
                    className="h-full w-full bg-transparent px-1 font-pixel outline-none" />
                </div>
              </Field>
              <Field label="Accent">
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map((a, i) => (
                    <button key={a.name} aria-label={a.name} aria-pressed={accent === i} onClick={() => setAccent(i)}
                      className={cn("size-11 border p-1", accent === i ? "border-foreground" : "border-line hover:border-foreground/30")}>
                      <span className="block size-full" style={{ background: a.hex }} />
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle n="02" title="Choose its brain" />
              <div className="grid grid-cols-3 gap-3">
                {MODELS.map((x) => {
                  const on = model === x.id;
                  return (
                    <button key={x.id} aria-pressed={on} onClick={() => setModel(x.id)}
                      className={cn("flex flex-col items-center gap-2 border bg-background px-3 py-4 text-center transition-opacity",
                        on ? "border-foreground shadow-[inset_0_0_24px_color-mix(in_oklab,var(--foreground)_12%,transparent)]" : "border-line opacity-60 hover:opacity-100")}>
                      <LaunchSprite name={x.core} color={x.color} scale={6} />
                      <span className="font-semibold">{x.label}</span>
                      <span className="text-[12px] text-muted-foreground">{x.line}</span>
                      <span className="mt-1 h-1.5 w-full bg-surface-2"><span className="block h-full" style={{ width: `${(x.burn / 10) * 100}%`, background: x.color }} /></span>
                      <span className="text-[11px] text-text-mute">~{x.burn} SOL/day</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[12px] text-muted-foreground">Powers · pick 1+</span>
                <div className="flex flex-wrap gap-2">
                  {POWERS.map((p) => {
                    const on = powers.includes(p);
                    return (
                      <button key={p} aria-pressed={on} onClick={() => setPowers(on ? powers.filter((q) => q !== p) : [...powers, p])}
                        className={cn("flex min-h-11 items-center gap-2 border px-3 text-[13px]",
                          on ? "border-alive bg-foreground/10 text-foreground" : "border-line text-muted-foreground hover:border-foreground/30")}>
                        <LaunchSprite name={p} color={on ? "var(--alive)" : "var(--text-mute)"} scale={2} />{p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle n="03" title="Stake" />
              <div className="grid grid-cols-3 gap-3">
                {FEES.map((f, i) => {
                  const on = fee === f;
                  return (
                    <button key={f} aria-pressed={fee === f} onClick={() => setFee(f)}
                      className={cn("flex flex-col items-center gap-2 border py-3", on ? "border-gold bg-foreground text-background" : "border-line bg-background hover:border-foreground/30")}>
                      <span className="flex items-end gap-0.5">
                        {Array.from({ length: i + 1 }).map((_, k) => <LaunchSprite key={k} name="coins" color="var(--gold)" scale={3} />)}
                      </span>
                      <span className="font-pixel text-[18px]">{f} SOL</span>
                    </button>
                  );
                })}
              </div>
              <div className="border border-line bg-background p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-text-mute">Runway</span>
                  <span><span className="font-pixel text-[22px]">{fee} SOL</span> <span className="ml-2 text-[13px] text-muted-foreground">~{turns} turns</span></span>
                </div>
                <div className="mt-3 flex h-3 gap-0.5">
                  {Array.from({ length: 20 }).map((_, k) => (
                    <span key={k} className="flex-1" style={{ background: k < Math.round((fee / 40) * 20) ? "var(--alive)" : "var(--surface-2)" }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip">{nameTrim}</span><span className="chip">${t}</span>
                <span className="chip">{m?.label}</span>{powers.map((p) => <span key={p} className="chip">{p}</span>)}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="size-3.5 accent-foreground" />
                I understand broke agents skip turns and can fall to ruins.
              </label>
            </>
          )}

          <div className="mt-auto flex shrink-0 items-center justify-between border-t border-line pt-4">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
            {step === 1 && <Button disabled={!step1ok} onClick={() => go(2)}>Continue</Button>}
            {step === 2 && <Button disabled={!step2ok} onClick={() => go(3)}>Continue</Button>}
            {step === 3 && <Button variant="destructive" disabled={!ack || !step1ok || !step2ok} onClick={launch}>Launch agent</Button>}
          </div>
        </section>
      </div>
    </main>
  );
}

function StepTitle({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div>
      <div className="font-pixel text-[12px] text-text-mute">{n} / 03</div>
      <h2 className="mt-1 text-[1.5rem] font-bold">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-[12px] text-launch">{error}</span>}
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-background p-4">
      <div className="text-[11px] uppercase tracking-wider text-text-mute">{label}</div>
      <div className="mt-1 font-pixel text-[22px]">{value}</div>
    </div>
  );
}
