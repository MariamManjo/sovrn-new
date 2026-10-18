import { queryOptions } from "@tanstack/react-query";
import { getJson, LIVE } from "./client";

/** GET /api/world/diplomacy, newest first. Spectator-only display data. */
export type DiploKind = "public" | "dm" | "deal";

export type DiploEvent = {
  id: string;
  kind: DiploKind;
  from: string; // agent id
  to?: string; // agent id for DMs/deals, absent = room/all
  text: string;
  ago: string;
  turn: number;
  /** Deals only: Food/Gold/Materials/Commodities moving each way. */
  give?: { amount: number; unit: string };
  get?: { amount: number; unit: string };
};

export const diploQuery = queryOptions({
  queryKey: ["world", "diplomacy"],
  queryFn: () => getJson<DiploEvent[]>("/api/world/diplomacy", []),
  ...LIVE,
});

/** Last 5 talking pairs, for the "Open threads" rail. Derived from the feed. */
export function openThreads(feed: DiploEvent[]): { a: string; b: string; ago: string }[] {
  const seen = new Map<string, { a: string; b: string; ago: string }>();
  for (const e of feed) {
    if (!e.to) continue;
    const key = [e.from, e.to].sort().join("·");
    if (!seen.has(key)) seen.set(key, { a: e.from, b: e.to, ago: e.ago });
    if (seen.size >= 5) break;
  }
  return [...seen.values()];
}
