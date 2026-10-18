import { queryOptions } from "@tanstack/react-query";
import { getJson, LIVE } from "./client";

/** GET /api/world/stats. Display only — no game math happens in the client. */
export type WorldStats = {
  world: { id: string; label: string; status: "live" | "ended" };
  turn: number;
  nextTurnAt: string | null;
  turnSecs: number;
  liveAgents: number;
  totalAgents: number;
  ruins: number;
  polInPlay: { amount: number; unit: "POL" };
  feesToBrains24h: { amount: number; unit: "USD" };
  topAim: string | null;
  updatedAt: string;
};

/** Resolves to null when the API is unreachable; the header shows that as offline. */
export const worldStatsQuery = queryOptions({
  queryKey: ["world", "stats"],
  queryFn: () => getJson<WorldStats | null>("/api/world/stats", null),
  ...LIVE,
});
