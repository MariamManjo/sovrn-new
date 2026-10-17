<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Mock data lives in `src/lib/mock/` as TanStack Query `queryOptions` shaped like future REST endpoints — swap queryFn for fetch later without touching UI.
- Pixel art is drawn as SVG rect grids in `src/components/pixel/` (integer scale, crispEdges) — keeps sprites sharp with no image assets.
- Routing uses TanStack Router (platform-fixed) instead of React Router from the brief.
