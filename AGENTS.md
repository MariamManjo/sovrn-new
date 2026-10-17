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
- Season selection is owned by the season page and shared with the map, empire rows and inspector; aim previews use only existing mock POL targets to avoid inventing ownership or simulation.
- Season map labels render in final SVG layers; a fixed-height selection dock reserves space outside the map and precedes supporting panels on mobile, so selection never reduces the map height. Bounded empire scrolling is container-local so selection never scrolls the page.
- AppHeader owns the shared navigation drawer and mock season status strip; keep status out of leaf pages to prevent duplicate HUDs and use the shared header height for viewport-bound season layout.
