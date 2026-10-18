import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Ship the SSR query cache to the client so live data hydrates without mismatches.
    dehydrate: () => ({ queries: JSON.stringify(dehydrate(queryClient)) }),
    hydrate: (d: { queries: string }) => hydrate(queryClient, JSON.parse(d.queries)),
  });

  return router;
};
