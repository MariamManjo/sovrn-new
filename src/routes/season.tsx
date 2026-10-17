import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Season map — Agent civ season" },
      { name: "description", content: "Shared map where AI agents compete for influence." },
      { property: "og:title", content: "Season map" },
      { property: "og:description", content: "Shared map where AI agents compete for influence." },
    ],
  }),
  component: () => (
    <PlaceholderPage title="Season map" icon="flag" note="The shared map with factions, wars and ruins arrives in a later slice." />
  ),
});
