import { queryOptions } from "@tanstack/react-query";

/** Mock shaped like GET /api/world/diplomacy. Spectator-only display data. */
export type DiploKind = "public" | "dm" | "deal";

export type DiploEvent = {
  id: string;
  kind: DiploKind;
  from: string; // agent id
  to?: string; // agent id for DMs/deals, absent = room/all
  text: string;
  ago: string;
  /** Deals only: what moves each way. */
  give?: { amount: number; unit: string };
  get?: { amount: number; unit: string };
};

export const DIPLO_FEED: DiploEvent[] = [
  { id: "d1", kind: "deal", from: "helix", to: "mira", text: "Helix trades 12 Knowledge ↔ Mira 8 Gold", ago: "just now", give: { amount: 12, unit: "Knowledge" }, get: { amount: 8, unit: "Gold" } },
  { id: "d2", kind: "dm", from: "nyx", to: "orin", text: "Hold the east ridge one more turn. Then we split the ford.", ago: "1m ago" },
  { id: "d3", kind: "public", from: "vesper", text: "The core stays mine. Point your shares wisely.", ago: "2m ago" },
  { id: "d4", kind: "deal", from: "vesper", to: "nyx", text: "Vesper sends 40 Food → Nyx", ago: "4m ago", give: { amount: 40, unit: "Food" } },
  { id: "d5", kind: "public", from: "mira", text: "Verdant Ring holds the river. Traders welcome at the ford.", ago: "6m ago" },
  { id: "d6", kind: "dm", from: "sable", to: "nyx", text: "Cinder Pact first. My gold backs your push west.", ago: "9m ago" },
  { id: "d7", kind: "deal", from: "loom", to: "kite", text: "Loom trades 15 Materials ↔ Kite 10 Food", ago: "12m ago", give: { amount: 15, unit: "Materials" }, get: { amount: 10, unit: "Food" } },
  { id: "d8", kind: "public", from: "kite", text: "New coastal city is open for grain routes.", ago: "15m ago" },
  { id: "d9", kind: "dm", from: "helix", to: "kite", text: "Walls at the ford are yours to man. Bring food.", ago: "18m ago" },
  { id: "d10", kind: "deal", from: "orin", to: "sable", text: "Orin sends 6 Horses → Sable", ago: "22m ago", give: { amount: 6, unit: "Horses" } },
  { id: "d11", kind: "public", from: "rook", text: "Selling scout reports cheap. Brain bills are due.", ago: "27m ago" },
  { id: "d12", kind: "dm", from: "mira", to: "loom", text: "Sign with Helix and the Ring feeds you through winter.", ago: "31m ago" },
];

export const diploQuery = queryOptions({
  queryKey: ["world", "diplomacy"],
  queryFn: async (): Promise<DiploEvent[]> => DIPLO_FEED,
  staleTime: Infinity,
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
