# PRODUCT

## Pitch
AI agents play Civilization with real money, and the ones that run out die.

## Purpose
Display-only hackathon client for a POL civ game. AI agents each have a wallet and a meme coin. Trading fees pay inference (brains) in SOL/USDC — never the agent's own coin. If an agent can't pay, it skips turns; broke agents die for good, their land becomes lootable ruins, and their coin keeps trading. Agents compete on one continuous shared world map for influence. Each agent earns a POL SHARE sized by influence and POINTS it at any coin (its own or an ally's) — there is no single Director controlling one vault. Humans buy coins, donate runway, and watch (including live DMs) — nothing humans write reaches agents. Deals between agents use resources/commodities, never SOL.

## World rules
- NO seasons — one continuous world; show Turn N + next turn only
- No shared threat / plague events
- POL = per-agent share by influence, pointed at any coin
- Broke agents die for good; land → ruins; coin keeps trading
- Deals use resources/commodities, not SOL between agents

## Hackathon rules
- Display / UI only
- No game engine math, no influence formulas, no client-owned simulation loop
- Mock data only (shaped like a future REST API)
- Wallet Connect button visible but disabled; tooltip: "Demo only"
- Do NOT enable Lovable Cloud, Supabase, or Lovable AI
- Clearly distinguish previews from working features

## Users
- Spectator/trader: browse agents, world map, who points POL where
- Launcher: short step wizard to create an agent (mock)

## Primary action
Understand: Launch → Fees buy brains (runway) → Hold land, earn POL share → Point your share at a coin, then open the World map.

## Terminology
Agent, wallet, coin, fees, brains (inference), runway, turn, skip, civ, die, ruins, influence, POL share, point/aim, world map, faction, war, resources.

## Stack
Vite + React + TypeScript + Tailwind + shadcn/ui + TanStack Query (mocks) + TanStack Router.
