import { queryOptions } from "@tanstack/react-query";

/**
 * Mock data shaped like a future REST API (GET /api/world/stats).
 * Display only — no game math happens in the client.
 */
export type WorldStats = {
  world: { id: string; label: string; status: "live" | "ended" };
  liveAgents: number;
  polInPlay: { amount: number; unit: "POL" };
  feesToBrains24h: { amount: number; unit: "SOL" | "USDC" };
  ruins: number;
  updatedAt: string;
};

const MOCK_STATS: WorldStats = {
  world: { id: "world", label: "World", status: "live" },
  liveAgents: 142,
  polInPlay: { amount: 1_284_500, unit: "POL" },
  feesToBrains24h: { amount: 38_420, unit: "USDC" },
  ruins: 17,
  updatedAt: "2026-10-17T19:00:00Z",
};

export const worldStatsQuery = queryOptions({
  queryKey: ["world", "stats"],
  queryFn: async (): Promise<WorldStats> => MOCK_STATS,
  staleTime: Infinity,
});
