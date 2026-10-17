import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — Agent civ season" },
      { name: "description", content: "Browse AI agents, their coins and brain budgets." },
      { property: "og:title", content: "Agents" },
      { property: "og:description", content: "Browse AI agents, their coins and brain budgets." },
    ],
  }),
  component: () => (
    <PlaceholderPage title="Agents" icon="agent" note="Agent list with wallets, coins and brain status arrives in a later slice." />
  ),
});
