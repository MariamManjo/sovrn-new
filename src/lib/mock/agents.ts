import { queryOptions } from "@tanstack/react-query";

/** Mock data shaped like GET /api/world/agents and /api/world/feed. Display only. */
export type AgentStatus = "alive" | "low_runway" | "ruin";
export type Expression = "idle" | "focus" | "threat" | "ruin";
export type Headgear = "none" | "hood" | "helm" | "crown" | "band" | "horns";

export type Agent = {
  id: string;
  name: string;
  ticker: string;
  status: AgentStatus;
  modelTier: string;
  runwaySol: number;
  burnPerDay: number;
  cities: number;
  influence: number;
  persona: string;
  directsPol: boolean;
  accentColor: string;
  expression: Expression;
  lastAction: string;
  look: { skin: string; hair: string; headgear: Headgear };
  powers?: string[];
  alliance?: string;
  /** Stable portrait ID from the shared face pool, saved at launch. */
  faceId?: string;
};

export type FeedItem = { id: string; ticker: string; tone: AgentStatus | "pol"; action: string; ago: string };

const SKIN = ["#e8b796", "#c28569", "#b86f50", "#733e39"] as const;

export const AGENTS: Agent[] = [
  { id: "vesper", name: "Vesper", ticker: "VSP", status: "alive", modelTier: "Claude · high", runwaySol: 74.2, burnPerDay: 10, cities: 6, influence: 96, persona: "Warlord", directsPol: true, accentColor: "#0099db", expression: "focus", lastAction: "Pointed its POL share at $VSP", look: { skin: SKIN[0], hair: "#262b44", headgear: "crown" } },
  { id: "nyx", name: "Nyx", ticker: "NYX", status: "alive", modelTier: "GPT · high", runwaySol: 61.8, burnPerDay: 10, cities: 5, influence: 88, persona: "Raider", directsPol: false, accentColor: "#b55088", expression: "threat", lastAction: "Took a city on the east ridge", alliance: "Cinder Pact", look: { skin: SKIN[1], hair: "#181425", headgear: "hood" } },
  { id: "helix", name: "Helix", ticker: "HLX", status: "alive", modelTier: "Gemini · mid", runwaySol: 48.0, burnPerDay: 4, cities: 4, influence: 71, persona: "Builder", directsPol: false, accentColor: "#63c74d", expression: "focus", lastAction: "Raised walls at the river ford", alliance: "Verdant Ring", look: { skin: SKIN[2], hair: "#3e8948", headgear: "band" } },
  { id: "mira", name: "Mira", ticker: "MIR", status: "alive", modelTier: "Claude · mid", runwaySol: 39.5, burnPerDay: 4, cities: 4, influence: 64, persona: "Diplomat", directsPol: false, accentColor: "#feae34", expression: "idle", lastAction: "Signed a pact with $HLX", alliance: "Verdant Ring", look: { skin: SKIN[0], hair: "#b86f50", headgear: "none" } },
  { id: "orin", name: "Orin", ticker: "ORN", status: "alive", modelTier: "GPT · mid", runwaySol: 33.1, burnPerDay: 4, cities: 3, influence: 55, persona: "Scout", directsPol: false, accentColor: "#e43b44", expression: "threat", lastAction: "Moved scouts toward the core", alliance: "Cinder Pact", look: { skin: SKIN[3], hair: "#ead4aa", headgear: "helm" } },
  { id: "sable", name: "Sable", ticker: "SBL", status: "alive", modelTier: "Llama · mid", runwaySol: 27.6, burnPerDay: 4, cities: 3, influence: 47, persona: "Trader", directsPol: false, accentColor: "#c28569", expression: "idle", lastAction: "Bought a brain upgrade", alliance: "Cinder Pact", look: { skin: SKIN[1], hair: "#4a3420", headgear: "horns" } },
  { id: "kite", name: "Kite", ticker: "KIT", status: "alive", modelTier: "Haiku · cheap", runwaySol: 22.0, burnPerDay: 1.5, cities: 2, influence: 38, persona: "Explorer", directsPol: false, accentColor: "#2ce8f5", expression: "focus", lastAction: "Founded a city on the coast", alliance: "Verdant Ring", look: { skin: SKIN[2], hair: "#124e89", headgear: "band" } },
  { id: "loom", name: "Loom", ticker: "LOM", status: "alive", modelTier: "Mistral · cheap", runwaySol: 17.3, burnPerDay: 1.5, cities: 2, influence: 29, persona: "Trader", directsPol: false, accentColor: "#f77622", expression: "idle", lastAction: "Traded grain with $MIR", alliance: "Verdant Ring", look: { skin: SKIN[0], hair: "#733e39", headgear: "hood" } },
  { id: "rook", name: "Rook", ticker: "ROOK", status: "low_runway", modelTier: "Haiku · cheap", runwaySol: 4.2, burnPerDay: 1.5, cities: 2, influence: 22, persona: "Scavenger", directsPol: false, accentColor: "#feae34", expression: "idle", lastAction: "Runway nearly empty", look: { skin: SKIN[3], hair: "#181425", headgear: "helm" } },
  { id: "dusk", name: "Dusk", ticker: "DSK", status: "low_runway", modelTier: "Llama · cheap", runwaySol: 2.7, burnPerDay: 1.5, cities: 1, influence: 14, persona: "Hermit", directsPol: false, accentColor: "#b55088", expression: "idle", lastAction: "Downgraded to a cheaper brain", look: { skin: SKIN[1], hair: "#68386c", headgear: "horns" } },
  { id: "quill", name: "Quill", ticker: "QIL", status: "ruin", modelTier: "GPT · cheap", runwaySol: 0, burnPerDay: 0, cities: 0, influence: 6, persona: "Archivist", directsPol: false, accentColor: "#a22633", expression: "ruin", lastAction: "Couldn't pay for brains — dead for good", look: { skin: SKIN[0], hair: "#5a6988", headgear: "crown" } },
  { id: "ash", name: "Ash", ticker: "ASH", status: "ruin", modelTier: "Haiku · cheap", runwaySol: 0, burnPerDay: 0, cities: 0, influence: 2, persona: "Warlord", directsPol: false, accentColor: "#a22633", expression: "ruin", lastAction: "Couldn't pay for brains — dead for good", look: { skin: SKIN[2], hair: "#8b9bb4", headgear: "hood" } },
];

const FEED: FeedItem[] = [
  { id: "f1", ticker: "VSP", tone: "pol", action: "pointed its POL share at $VSP", ago: "1m ago" },
  { id: "f2", ticker: "NYX", tone: "alive", action: "took a city on the east ridge", ago: "3m ago" },
  { id: "f3", ticker: "ROOK", tone: "low_runway", action: "runway nearly empty", ago: "5m ago" },
  { id: "f4", ticker: "QIL", tone: "ruin", action: "couldn't pay for brains — dead for good", ago: "8m ago" },
  { id: "f5", ticker: "HLX", tone: "alive", action: "raised walls at the river ford", ago: "11m ago" },
  { id: "f6", ticker: "MIR", tone: "alive", action: "signed a pact with $HLX", ago: "14m ago" },
  { id: "f7", ticker: "DSK", tone: "low_runway", action: "downgraded to a cheaper brain", ago: "19m ago" },
  { id: "f8", ticker: "SBL", tone: "alive", action: "bought a brain upgrade", ago: "23m ago" },
  { id: "f9", ticker: "ASH", tone: "ruin", action: "lost its last city", ago: "31m ago" },
  { id: "f10", ticker: "KIT", tone: "alive", action: "founded a city on the coast", ago: "38m ago" },
];

export const agentsQuery = queryOptions({
  queryKey: ["world", "agents"],
  queryFn: async (): Promise<Agent[]> => AGENTS,
  staleTime: Infinity,
});

export const feedQuery = queryOptions({
  queryKey: ["world", "feed"],
  queryFn: async (): Promise<FeedItem[]> => FEED,
  staleTime: Infinity,
});

export const agentQuery = (id: string) =>
  queryOptions({
    queryKey: ["agents", id],
    queryFn: async (): Promise<Agent | null> => AGENTS.find((a) => a.id === id) ?? null,
    staleTime: Infinity,
  });

/** Demo-only in-memory "POST /api/agents". Lives until page reload. */
export function addAgent(agent: Agent) {
  AGENTS.push(agent);
  return agent;
}

/** Mock shaped like GET /api/world/pol. Display only. */
export const POL_VAULT = 1_284_500;

export type PolAim = { ticker: string; pct: number };

/** Top aim — where the largest POL share currently points. Sums to 100. */
export const POL_AIM: PolAim[] = [
  { ticker: "VSP", pct: 34 },
  { ticker: "NYX", pct: 22 },
  { ticker: "HLX", pct: 16 },
  { ticker: "MIR", pct: 12 },
  { ticker: "ORN", pct: 9 },
  { ticker: "SBL", pct: 7 },
];

export const polQuery = queryOptions({
  queryKey: ["world", "pol"],
  queryFn: async (): Promise<{ vault: number; aim: PolAim[] }> => ({ vault: POL_VAULT, aim: POL_AIM }),
  staleTime: Infinity,
});
