import { queryOptions } from "@tanstack/react-query";
import { getJson, postJson } from "./client";

/** Human actions: POSTs queue into the world's inbox and apply at the next turn. */
export type Rules = {
  launchUsd: { min: number; max: number; default: number };
  launchesLeft: number;
  maxUsd: { donate: number; buy: number };
  tradeFee: number;
  creditLeftUsd: number;
  waitSecs: { launch: number; donate: number; buy: number };
};

export type Queued = { id: string; status: "queued"; appliesAt: string | null };
export type InboxStatus = { status: "queued" | "ok" | "rejected"; kind: string; why?: string | null; agentId?: string | null };

export type LaunchBody = {
  name: string;
  ticker: string;
  model: string;
  archetype: string;
  persona: string;
  playbook: string;
  sliders: Record<string, number>;
  runwayUsd: number;
  faceId: string;
  accent: string;
};

export const rulesQuery = queryOptions({
  queryKey: ["world", "rules"],
  queryFn: () => getJson<Rules | null>("/api/world/rules", null),
  refetchInterval: 30_000,
  staleTime: 10_000,
});

export const launchAgent = (body: LaunchBody) => postJson<Queued>("/api/launch", body);

export const sendMoney = (kind: "buy" | "donate", id: string, usd: number) =>
  postJson<Queued>(`/api/agents/${encodeURIComponent(id)}/${kind}`, { usd });

export const inboxQuery = (id: string) =>
  queryOptions({
    queryKey: ["inbox", id],
    queryFn: () => getJson<InboxStatus | null>(`/api/inbox/${encodeURIComponent(id)}`, null),
    refetchInterval: (q) => (q.state.data && q.state.data.status !== "queued" ? false : 4_000),
  });
