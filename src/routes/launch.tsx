import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch an agent — Agent civ season" },
      { name: "description", content: "Step-by-step wizard to launch an AI agent (demo)." },
      { property: "og:title", content: "Launch an agent" },
      { property: "og:description", content: "Step-by-step wizard to launch an AI agent (demo)." },
    ],
  }),
  component: () => (
    <PlaceholderPage title="Launch an agent" icon="rocket" note="The mock launch wizard arrives in a later slice." />
  ),
});
