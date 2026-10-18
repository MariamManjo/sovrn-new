import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent } from "@/lib/api/agents";
import { inboxQuery, rulesQuery, sendMoney, type Queued } from "@/lib/api/actions";
import { Button } from "@/components/ui/button";
import { cents, cn, usd } from "@/lib/utils";

export type MoneyKind = "buy" | "donate";

/** "in 3:07" until the next turn; turns can run late, hence "any moment". */
export function useTurnCountdown(at: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = at ? Date.parse(at) - now : NaN;
  if (Number.isNaN(ms)) return "soon";
  if (ms <= 0) return "any moment";
  const s = Math.ceil(ms / 1000);
  return `in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const PRESETS: Record<MoneyKind, number[]> = { buy: [1, 5, 10], donate: [0.02, 0.05, 0.1] };

export function MoneyPanel({ agent, kind, onClose }: { agent: Agent; kind: MoneyKind; onClose: () => void }) {
  const { data: rules } = useQuery(rulesQuery);
  const [amount, setAmount] = useState(String(PRESETS[kind][1]));
  const [sent, setSent] = useState<Queued | null>(null);
  const send = useMutation({ mutationFn: (v: number) => sendMoney(kind, agent.id, v), onSuccess: setSent });

  const max = rules?.maxUsd[kind] ?? PRESETS[kind][2]!;
  const fee = rules?.tradeFee ?? 0.01;
  const value = Number(amount);
  const toRunway = kind === "buy" ? value * fee : value;
  const turns = agent.burnPerTurn > 0 && toRunway > 0 ? Math.floor(toRunway / agent.burnPerTurn) : null;
  const err = !(value > 0 && value <= max) ? `Enter an amount up to ${cents(max)}.`
    : rules && toRunway > rules.creditLeftUsd ? "The playtest's money cap is reached." : null;
  const hint = kind === "buy"
    ? `Playtest money is free and no coin changes hands: only the ${+(fee * 100).toFixed(2)}% trading fee lands, as runway.`
    : `Playtest money is free. All of it goes to ${agent.name}'s runway.`;

  return (
    <div className="border border-line bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="caps text-foreground">{kind === "buy" ? `Buy $${agent.ticker}` : `Donate to ${agent.name}`}</div>
          <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
        </div>
        <button onClick={onClose} className="caps min-h-11 px-2 text-text-mute hover:text-foreground">Close</button>
      </div>
      {sent ? (
        <MoneyStatus agent={agent} kind={kind} queued={sent} runway={toRunway} />
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (!err) send.mutate(value); }}>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex h-11 w-28 items-center border border-line bg-surface focus-within:border-foreground">
              <span className="pl-3 text-text-mute">$</span>
              <input value={amount} inputMode="decimal" aria-label="Amount in USD"
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="h-full w-full bg-transparent px-1 font-mono outline-none" />
            </div>
            {PRESETS[kind].map((p) => (
              <button key={p} type="button" onClick={() => setAmount(String(p))}
                className={cn("chip min-h-11 cursor-pointer px-3", value === p && "!border-foreground text-foreground")}>{cents(p)}</button>
            ))}
            <Button type="submit" disabled={!!err || send.isPending} className="ml-auto">
              {send.isPending ? "Sending…" : kind === "buy" ? "Buy" : "Donate"}
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            +{usd(toRunway > 0 ? toRunway : 0)} runway{turns !== null ? ` ≈ ${turns} more turns` : ""}, applied at the next turn.
          </p>
          {(send.error || (amount && err)) && <p className="mt-1 text-[12px] text-launch">{send.error?.message ?? err}</p>}
        </form>
      )}
    </div>
  );
}

function MoneyStatus({ agent, kind, queued, runway }: { agent: Agent; kind: MoneyKind; queued: Queued; runway: number }) {
  const qc = useQueryClient();
  const { data } = useQuery(inboxQuery(queued.id));
  const countdown = useTurnCountdown(queued.appliesAt);
  const status = data?.status ?? "queued";
  useEffect(() => {
    if (status === "ok") {
      qc.invalidateQueries({ queryKey: ["agents", agent.id] });
      qc.invalidateQueries({ queryKey: ["world"] });
    }
  }, [status, qc, agent.id]);
  if (status === "ok") return <p className="mt-3 text-[13px] text-[var(--alive)]">Done. {agent.name} got +{usd(runway)} runway.</p>;
  if (status === "rejected") {
    return <p className="mt-3 text-[13px] text-launch">Rejected: {data?.why ?? `${agent.name} died before the turn`}.</p>;
  }
  return (
    <p className="mt-3 text-[13px] text-muted-foreground">
      {kind === "buy" ? "Buy" : "Donation"} queued. It applies at the next turn, {countdown}.
    </p>
  );
}
