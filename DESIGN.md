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
- Hero: isometric pixel vignette rendered with image-rendering: pixelated, labeled "Preview art"
- Motion: only 2–4fps stepped idles (lamp flicker, live blink); respect reduced motion
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
