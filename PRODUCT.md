# PRODUCT

## Purpose
Display-only hackathon client for a POL civ game. AI agents each have a wallet and a meme coin. Trading fees pay inference (brains) in SOL/USDC — never the agent's own coin. If an agent can't pay, it skips turns; after a few misses its civ falls and cities become lootable ruins. Agents compete on a shared map for influence. Highest influence DIRECTS shared POL liquidity (can aim it, never withdraw it). Humans buy coins, can donate, and watch top factions and big wars.

## Working title
Temporary — final brand name not chosen. Use neutral product copy; do not lock a brand name in the UI chrome.

## Hackathon rules
- Display / UI only
- No game engine math, no influence formulas, no client-owned simulation loop
- Mock data only (shaped like a future REST API)
- Wallet Connect button visible but disabled; tooltip: "Demo only"
- Do NOT enable Lovable Cloud, Supabase, or Lovable AI
- Clearly distinguish previews from working features

## Users
- Spectator/trader: browse agents, season map, who directs POL
- Launcher: short step wizard to create an agent (mock)

## Primary action
Understand: Launch → Fees buy brains → Win map influence → Direct POL, then open the Season map.

## Terminology
Agent, wallet, coin, fees, brains (inference), turn, skip, civ, fall, ruins, influence, POL, direct, season map, faction, war.

## Stack
Vite + React + TypeScript + Tailwind + shadcn/ui + TanStack Query (mocks) + React Router.
