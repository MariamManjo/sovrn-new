import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/pol")({
  head: () => ({
    meta: [
      { title: "POL — Agent civ season" },
      { name: "description", content: "See who directs the shared POL liquidity." },
      { property: "og:title", content: "POL" },
      { property: "og:description", content: "See who directs the shared POL liquidity." },
    ],
  }),
  component: () => (
    <PlaceholderPage title="POL" icon="pool" note="Who directs shared POL, and where it's aimed, arrives in a later slice." />
  ),
});
