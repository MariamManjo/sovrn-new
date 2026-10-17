# DESIGN

## Style
Developer-focused, dense, product-grade, card-first, high-contrast dark, sharp, launchpad-serious.
Reference patterns (do not copy logos): AgencyPad, HiggsPad, HookedPad, Bordrless, Perpspad, Crawlnet, Geocaching play.

## Forbidden
Cinematic curtains, velvet stage, childish mascots, purple SaaS gradients, neon crypto templates.

## Visual system v2 — colorful pixel / isometric town (approved, replaces black+lime)
References (patterns only): Retro Diffusion isometric + UI panels, isometric town square (red/blue roofs, timber, cobble, striped awnings, lamp gold), exfil.fun/arena (color = state, live pulses). Structure stays AgencyPad/HiggsPad: stats + StepCards + CTAs.
- Background: deep indigo/dusk purple wash with subtle dot dither — never pure black
- Palette tokens: roof red, roof blue, lamp gold (primary), grass green, POL teal, ruin ash, warm stone panels, timber brown, ink outline, warm off-white text
- State colors: green = live, gold = fees/brains, teal = POL, red = ruins/danger
- Surfaces: `pixel-panel` (3px ink border, inner highlight/shade edge, hard 4px drop), optional `pixel-dither`. Buttons `pixel-btn`: raised block, pressed 4px offset. No glassmorphism, no 1px SaaS borders, no rounded corners
- Stats: each tile its own accent color (top bar, icon, number)
- StepCards 01–04: shop-sign headers red / blue / gold / teal
- Type: Silkscreen pixel font for labels, nav, numbers, buttons; Pixelify Sans for headings; Work Sans body
- Reference images are STYLE GUIDES ONLY — never embed reference photos/PNGs as UI assets
- Home = tactical pixel HUD: full-bleed procedural SVG stage (isometric diamond grid, multi-color tiles, POL teal core, concentric arena rings, iso houses with red/blue roofs, gold lamps, ash ruins, rectangle agent sprites) with HUD chrome on top: gold corner brackets, hero copy in a framed panel, floating stat pods (one color each), bottom hotbar of StepCards 01–04
- `pixel-frame`: stair-stepped border via box-shadow + hard offset shadow
- Motion: only 2–4fps stepped idles (lamp flicker, live blink, agent bob, flag wave) + subtle stepped ring pulse; respect reduced motion. No blur filters faking pixels
- Forbidden: black+lime only, 1px borders, Inter-only, cute pastel kids UI, curtains

## Slice 1 (Home)
Headline, stats strip (Live agents, POL directed, Fees → brains 24h, Ruins), four StepCards 01–04 (Launch, Fees buy brains, Win map influence, Direct POL), CTAs: Open Season map, Launch agent.

## Pixel art direction (approved)
- Sharp 16-bit / retro-terminal pixel art as ACCENTS only: icons, step numbers, status chips, small agent avatars, map tiles later
- Tactical strategy-game HUD feel (Civ-lite / Crawlnet). NOT cute Nintendo mascot, NOT soft cartoon, NOT Roblox/kid game
- Crisp grid: integer scale only, no blurry upscaling
- UI chrome stays modern shadcn cards; pixel art is the flavor layer
- Palette: see Visual system v2
- No heavy animation; tiny pixel blink OK for "live" status

## Palette v3 — Lospec "Fantasy RPG" (LOCKED, replaces indigo/neon)
Source: https://lospec.com/palette-list/fantasy-rpg. No colors outside this set.

| Token | Hex | Use |
|---|---|---|
| --bg0 | #0d0a05 | deepest stage, outlines/ink, drop shadows |
| --bg1 | #1c1508 | page background |
| --panel | #2e2010 | cards, panels |
| --panel2 | #4a3420 | raised panels, active nav, earth tiles |
| --border-c | #7a5c38 | panel borders, timber, earth tiles |
| --muted-c | #b08858 | ruin ash, house shade walls |
| --text | #e8e0c8 | body text |
| --text-dim | #d4b880 | secondary text, house walls, stars |
| --parchment | #f0e0b0 | headline, text on colored buttons |
| --gold | #c8952a | headline line 2, POL stat, step 04, POL core, lamps, brackets |
| --alive | #3a9e50 | grass tiles |
| --alive-bright | #7dd87a | live agents stat, live dot |
| --water | #2a5090 | Enter season button, step 02, blue roofs |
| --water-bright | #5b8fd4 | map water tiles, arena ring |
| --fire | #d44040 | Launch button, step 01, ruins, red roofs |
| --magic | #8840c0 | influence / special chips, step 03, fees→brains, outer ring |

Map ground is earth browns (panel/panel2/border) with patches of alive — never a neon green grid.
