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

- Live data comes from the playtest JSON API via TanStack Query `queryOptions` in `src/lib/api/`; base URL is `API_BASE` in `config.ts`, and fetch failures resolve to empty data so pages never crash.
- Pixel art is drawn as SVG rect grids in `src/components/pixel/` (integer scale, crispEdges); the world map is the exception, a native canvas in `src/components/season/` blitted at whole-number scale.
- Routing uses TanStack Router (platform-fixed) instead of React Router from the brief.
- Season selection is owned by the season page and shared with the map, empire rows and inspector; aim previews use only existing mock POL targets to avoid inventing ownership or simulation.
- Season map labels render in final SVG layers; a fixed-height selection dock reserves space outside the map and precedes supporting panels on mobile, so selection never reduces the map height. Bounded empire scrolling is container-local so selection never scrolls the page.
- AppHeader owns the shared navigation drawer and mock season status strip; keep status out of leaf pages to prevent duplicate HUDs and use the shared header height for viewport-bound season layout.

- AgentAvatar owns portrait rendering, gray missing-image fallback and the logo ring; sizes are 32/64/96/128 only so the 32-native faces stay crisp. agentFaces maps IDs to `/public/faces/*.png` so every surface uses the same local art.
