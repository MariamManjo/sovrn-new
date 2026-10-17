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

## Palette v4 — Season HUD / Endesga 32 (LOCKED, replaces Fantasy RPG)
Source: https://lospec.com/palette-list/endesga-32. Only Endesga 32 hexes allowed. Warm civ map colors + cool metal UI.

| Token | Hex | Use |
|---|---|---|
| --ink | #181425 | page bg, pixel outlines |
| --shade | #262b44 | stage, header, hotbar tray |
| --panel | #3a4466 | all cards/panels (lighter than bg) |
| --panel-edge | #5a6988 | all panel borders, Connect wallet border |
| --text | #ffffff | body + UI labels, headline line 1 |
| --text-dim | #c0cbdc | secondary text, nav, Connect wallet text |
| --text-mute | #8b9bb4 | units, corner brackets, ruin tiles |
| --parchment | #ead4aa | ONE headline accent line only; house walls |
| --alive / --alive-deep | #63c74d / #265c42 | live agents, live dot / grass tiles |
| --pol / --pol-glow | #0099db / #2ce8f5 | POL accent, step 04 / POL core, rings |
| --water-deep | #124e89 | Enter season button, water, blue roofs |
| --launch | #e43b44 | Launch button, step 01, red roofs |
| --ruin / --alert | #a22633 / #ff0044 | Ruins accent / ruins number |
| --gold / --gold-light | #feae34 / #fee761 | POL $ numbers only / lamps, stars |
| --influence / --influence-deep | #b55088 / #68386c | step 03, outer ring / Demo data chip |
| --fees | #f77622 | step 02, Fees → brains stat |
| --civ-earth / --civ-timber | #b86f50 / #733e39 | soil tiles / timber, island side |

Contrast rules: body text is text/text-dim on ink or panel — never cream on brown. Panels are always lighter than the background. Borders are panel-edge, never gold. Max one accent line in headlines. Stat pods: panel bg + 6px left accent stripe; number in accent color (POL number gold on POL accent).
