import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old links: the map moved to /world when seasons were ruled out. */
export const Route = createFileRoute("/season")({
  validateSearch: (search: Record<string, unknown>): { agent?: string } =>
    typeof search["agent"] === "string" ? { agent: search["agent"] } : {},
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/world", search, statusCode: 301 });
  },
});
