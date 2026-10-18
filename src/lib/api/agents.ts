import { queryOptions } from "@tanstack/react-query";
import { getJson, LIVE } from "./client";

/** Shapes of GET /api/world/agents, /api/agents/:id, /api/world/feed and /api/world/pol. Display only. */
export type AgentStatus = "alive" | "low_runway" | "ruin";
export type Expression = "idle" | "focus" | "threat" | "ruin";
export type Headgear = "none" | "hood" | "helm" | "crown" | "band" | "horns";

export type Agent = {
  id: string;
  name: string;
  ticker: string;
  status: AgentStatus;
  model: string; // full OpenRouter id
  modelTier: string;
  archetype: string;
  persona: string;
  runwayUsd: number;
  burnPerTurn: number;
  turnsLeft: number | null;
  regions: number;
  influence: number;
  influencePct: number; // 0–100 share of POL
  aimsAt: string | null;
  directsPol: boolean;
  accentColor: string;
  expression: Expression;
  look: { skin: string; hair: string; headgear: Headgear };
  lastAction: string;
  powers: string[]; // techs
  alliance: string | null;
  stock: { food: number; gold: number; materials: number; commodities: number };
  joinedTurn: number;
  diedTurn: number | null;
  /** Only on /api/agents/:id: the agent's latest notes to itself, public once their turn ends. */
  notes?: string | null;
  /** Stable portrait ID from the shared face pool, saved at launch. */
  faceId?: string;
};

export type FeedItem = { id: string; ticker: string; tone: AgentStatus | "pol"; action: string; ago: string };

export type PolAim = { ticker: string; pct: number };

export const agentsQuery = queryOptions({
  queryKey: ["world", "agents"],
  queryFn: () => getJson<Agent[]>("/api/world/agents", []),
  ...LIVE,
});

export const feedQuery = queryOptions({
  queryKey: ["world", "feed"],
  queryFn: () => getJson<FeedItem[]>("/api/world/feed", []),
  ...LIVE,
});

export const agentQuery = (id: string) =>
  queryOptions({
    queryKey: ["agents", id],
    queryFn: () => getJson<Agent | null>(`/api/agents/${encodeURIComponent(id)}`, null),
    ...LIVE,
  });

export const polQuery = queryOptions({
  queryKey: ["world", "pol"],
  queryFn: () => getJson<{ vault: number; aim: PolAim[] }>("/api/world/pol", { vault: 0, aim: [] }),
  ...LIVE,
});
