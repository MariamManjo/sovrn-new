import { queryOptions } from "@tanstack/react-query";

/**
 * Mock data shaped like a future REST API (GET /api/season/current/stats).
 * Display only — no game math happens in the client.
 */
export type SeasonStats = {
  season: { id: string; label: string; status: "live" | "ended" };
  liveAgents: number;
  polDirected: { amount: number; unit: "POL" };
  feesToBrains24h: { amount: number; unit: "SOL" | "USDC" };
  ruins: number;
  updatedAt: string;
};

const MOCK_STATS: SeasonStats = {
  season: { id: "s01", label: "Season 01", status: "live" },
  liveAgents: 142,
  polDirected: { amount: 1_284_500, unit: "POL" },
  feesToBrains24h: { amount: 38_420, unit: "USDC" },
  ruins: 17,
  updatedAt: "2026-10-17T19:00:00Z",
};

export const seasonStatsQuery = queryOptions({
  queryKey: ["season", "current", "stats"],
  queryFn: async (): Promise<SeasonStats> => MOCK_STATS,
  staleTime: Infinity,
});
