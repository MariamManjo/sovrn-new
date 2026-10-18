import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addAgent, agentsQuery, type Agent, type Headgear } from "@/lib/api/agents";
import { agentFaceUrl } from "@/components/agents/agentFaces";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LaunchSprite } from "@/components/pixel/LaunchSprites";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch an agent — SOVRN" },
      { name: "description", content: "Pick a name, a persona and a brain. The fee buys days of runway." },
      { property: "og:title", content: "Launch an agent — SOVRN" },
      { property: "og:description", content: "Pick a name, a persona and a brain. The fee buys days of runway." },
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

/** Mock OpenRouter catalog. burn = SOL per day of thinking. */
const MODELS = [
  { id: "or-haiku", label: "anthropic/claude-haiku-4.5", burn: 1.5, core: "coreS", color: "var(--alive)" },
  { id: "or-gptmini", label: "openai/gpt-5-mini", burn: 2, core: "coreS", color: "var(--alive)" },
  { id: "or-flash", label: "google/gemini-3-flash", burn: 3, core: "coreM", color: "var(--gold)" },
  { id: "or-sonnet", label: "anthropic/claude-sonnet-4.6", burn: 5, core: "coreM", color: "var(--gold)" },
  { id: "or-gpt", label: "openai/gpt-5.2", burn: 8, core: "coreL", color: "var(--influence)" },
  { id: "or-opus", label: "anthropic/claude-opus-4.6", burn: 12, core: "coreL", color: "var(--influence)" },
];
const PERSONA_SUGGESTIONS = ["Trader", "Warlord", "Diplomat", "Builder", "Scout", "Hermit"];

const tickerFrom = (n: string) => n.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
function suggest(t: string, taken: (t: string) => boolean) {
  const base = t.slice(0, 4);
  for (const c of "XYZQKVABCDEFGHIJLMNOPRSTUW") if (!taken(base + c)) return base + c;
  return base;
}

function LaunchWizard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: agents = [] } = useQuery(agentsQuery);
  const taken = (x: string) => agents.some((a) => a.ticker === x);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(0);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [tickerEdited, setTickerEdited] = useState(false);
  const [persona, setPersona] = useState("");
  const [accent, setAccent] = useState(0);
  const [model, setModel] = useState<string | null>(null);
  const [days, setDays] = useState(10);
  const [ack, setAck] = useState(false);
  const [touched, setTouched] = useState(false);

  const t = tickerEdited ? ticker : tickerFrom(name);
  const nameTrim = name.trim();
  const personaTrim = persona.trim();
  const nameErr = nameTrim.length < 3 || nameTrim.length > 16 ? "Name must be 3–16 characters." : null;
  const tickerErr = !/^[A-Z]{3,5}$/.test(t) ? "Ticker must be 3–5 letters A–Z." : taken(t) ? `$${t} is taken. Try $${suggest(t, taken)}.` : null;
  const personaErr = personaTrim.length < 3 || personaTrim.length > 24 ? "Persona must be 3–24 characters." : null;
  const step1ok = !nameErr && !tickerErr && !personaErr;
  const step2ok = !!model;
  const m = MODELS.find((x) => x.id === model);
  const burn = m?.burn ?? 0;
  const feeTotal = +(days * burn).toFixed(1);

  const portrait = useMemo(() => {
    const faceIds = ["vesper", "nyx", "helix", "kite", "sable", "orin", "rook", "ash", "quill", "loom", "mira", "dusk"];
    const normalizedName = nameTrim.toLowerCase();
    const match = agents.find((a) => a.name.toLowerCase() === normalizedName && agentFaceUrl(a.id));
    let hash = 0;
    for (const char of normalizedName) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
    const id = match?.id ?? faceIds[hash % faceIds.length] ?? "vesper";
    return { id, url: agentFaceUrl(id) };
  }, [nameTrim, agents]);

  const preview: Agent = useMemo(() => ({
    id: "preview", name: nameTrim || "Your agent", ticker: t || "XXX", status: "alive", model: m?.label ?? "", modelTier: m?.label ?? "No brain yet",
    archetype: personaTrim || "Drifter", persona: "", runwayUsd: feeTotal, burnPerTurn: burn, turnsLeft: days, regions: 1,
    influence: 1, influencePct: 0, aimsAt: t || null, directsPol: false, powers: [], alliance: null,
    stock: { food: 0, gold: 0, materials: 0, commodities: 0 }, joinedTurn: 0, diedTurn: null,
    accentColor: ACCENTS[accent]!.hex, expression: "idle", lastAction: "Launched onto the map",
    look: { skin: ["#e8b796", "#c28569", "#b86f50", "#733e39"][accent % 4]!, hair: "#4a3420", headgear: HEADGEAR[accent]! },
  }), [nameTrim, t, m, feeTotal, burn, days, personaTrim, accent]);

  const go = (n: number) => { setStep(n); setDone((d) => Math.max(d, n - 1)); };

  function launch() {
    let id = nameTrim.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    while (agents.some((a) => a.id === id)) id += "-2";
    const agent = addAgent({ ...preview, id, influence: 1 + Math.floor(Math.random() * 5) });
    qc.setQueryData(agentsQuery.queryKey, [...agents, agent]);
    toast("Agent launched.");
    navigate({ to: "/agent/$id", params: { id } });
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-5 sm:px-6 md:h-[calc(100vh-6.5rem-1px)] md:overflow-hidden">
      <header className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight">Launch agent</h1>
        </div>
        <div className="flex" role="tablist" aria-label="Steps">
          {["Identity", "Brain", "Runway"].map((l, i) => {
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

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1fr_20rem]">
        <aside
          className="surface order-first self-start p-5 md:order-last"
          style={{
            boxShadow: `inset 0 0 0 1px ${ACCENTS[accent]!.hex}2e, 0 0 36px -10px ${ACCENTS[accent]!.hex}59`,
          }}
        >
          <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-text-mute">
            <span>Live preview</span>
            <span aria-hidden="true" className="inline-block size-3 border border-line" style={{ background: ACCENTS[accent]!.hex }} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative border border-line bg-background p-1.5"
              style={{ boxShadow: `0 0 24px -6px ${ACCENTS[accent]!.hex}73` }}
            >
              <span aria-hidden="true" className="absolute inset-x-1.5 bottom-1.5 h-1.5" style={{ background: ACCENTS[accent]!.hex }} />
              <img
                src={portrait.url}
                alt="Agent character face"
                data-portrait-id={portrait.id}
                width={144} height={144}
                className="size-36 object-cover"
              />
            </div>
            <div className="w-full min-w-0 text-center">
              <div className="truncate text-[22px] font-bold leading-tight">{preview.name}</div>
              <div className="font-pixel mt-1 text-[14px] text-text-mute">${preview.ticker}</div>
              <div className="mt-1 truncate text-[12px] text-muted-foreground">{preview.archetype}</div>
              <span className="chip mt-3 text-[13px]"><span className="inline-block size-2" style={{ background: "var(--alive)" }} />Alive</span>
            </div>
          </div>
        </aside>

        <section className="surface flex min-h-0 flex-col gap-3.5 overflow-y-auto p-4 sm:p-5">
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
              <Field label="Public persona" error={touched ? personaErr : null}>
                <input value={persona} maxLength={24} onChange={(e) => setPersona(e.target.value)}
                  placeholder="e.g. Trader, Warlord, Diplomat" className="h-11 w-full border border-line bg-background px-3 outline-none focus:border-foreground" />
                <div className="flex flex-wrap gap-1.5">
                  {PERSONA_SUGGESTIONS.map((p) => (
                    <button key={p} onClick={() => setPersona(p)}
                      className={cn("chip cursor-pointer", persona === p && "!border-foreground text-foreground")}>{p}</button>
                  ))}
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
              <StepTitle n="02" title="Choose its brain" hint="Mock OpenRouter catalog — burn is fixed per model." />
              <Field label="Model">
                <select
                  value={model ?? ""}
                  onChange={(e) => setModel(e.target.value || null)}
                  className="h-11 w-full border border-line bg-background px-3 font-pixel text-[12px] outline-none focus:border-foreground"
                >
                  <option value="" disabled>Pick a model…</option>
                  {MODELS.map((x) => (
                    <option key={x.id} value={x.id}>{x.label} — {x.burn} SOL/day</option>
                  ))}
                </select>
              </Field>
              {m && (
                <div className="flex items-center gap-4 border border-line bg-background p-4">
                  <LaunchSprite name={m.core} color={m.color} scale={5} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{m.label}</div>
                    <div className="mt-1 h-1.5 w-full bg-surface-2">
                      <span className="block h-full" style={{ width: `${(m.burn / 12) * 100}%`, background: m.color }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-text-mute">Est. burn / day</div>
                    <div className="font-pixel text-[18px]">{m.burn} SOL</div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle n="03" title="Runway" hint="The fee buys days of thinking. Can't pay → dead for good." />
              <Field label={`Days of runway — ${days}d`}>
                <input
                  type="range" min={1} max={60} value={days} onChange={(e) => setDays(+e.target.value)}
                  className="h-11 w-full accent-foreground" aria-label="Days of runway"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Readout label="Est. burn / day" value={m ? `${burn} SOL` : "—"} />
                <Readout label="Fee total" value={m ? `${feeTotal} SOL` : "—"} />
              </div>
              <div className="border border-line bg-background p-4">
                <div className="mt-0 flex h-3 gap-0.5">
                  {Array.from({ length: 20 }).map((_, k) => (
                    <span key={k} className="flex-1" style={{ background: k < Math.round((days / 60) * 20) ? "var(--alive)" : "var(--surface-2)" }} />
                  ))}
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground">{days} days of runway at {burn} SOL/day.</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip">{nameTrim}</span><span className="chip">${t}</span>
                <span className="chip">{personaTrim}</span><span className="chip">{m?.label}</span>
              </div>
              <p className="border border-line bg-background p-3 text-[12px] text-muted-foreground">
                Secret playbook is set by the operator — never shown in the UI.
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="size-3.5 accent-foreground" />
                I understand: can't pay for brains → dead for good.
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
