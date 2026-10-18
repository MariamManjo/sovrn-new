import type { Agent } from "@/lib/api/agents";
import { FAMILY, INK, STONE, familyOf, mix, rgb } from "@/lib/sovrn-palette";
import { isoRingPixels, ringPixels, type IdleFrame, type Px } from "@/components/pixel/ring";

/** The logo slab at native resolution; callers blit it at whole-number scale only. */

export const W = 288;
export const H = 176;
export const N = 16;
const CX = W / 2;
const TOPY = 28;
const STEP = 3;
const PLINTH = 5;
const C = (N - 1) / 2;

export type Seat = { i: number; j: number };

/** Fixed settlement slots; agents beyond this count stay off the map but remain in the list. */
const SLOTS: Seat[] = [
  { i: 6, j: 8 }, { i: 11, j: 4 }, { i: 4, j: 10 }, { i: 9, j: 11 }, { i: 12, j: 8 }, { i: 5, j: 4 },
  { i: 3, j: 12 }, { i: 10, j: 13 }, { i: 13, j: 6 }, { i: 6, j: 12 }, { i: 13, j: 2 }, { i: 14, j: 4 },
];

/** Seats the top agents by influence; an id hashes to a preferred slot so seats rarely move between turns. */
export function seatAgents(agents: Agent[]): Map<string, Seat> {
  const top = [...agents].sort((a, b) => b.influence - a.influence).slice(0, SLOTS.length);
  const free = new Set(SLOTS.keys());
  const seats = new Map<string, Seat>();
  for (const a of top.sort((a, b) => a.id.localeCompare(b.id))) {
    let k = [...a.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % SLOTS.length;
    while (!free.has(k)) k = (k + 1) % SLOTS.length;
    free.delete(k);
    seats.set(a.id, SLOTS[k]!);
  }
  return seats;
}

/** Native width that holds every seat's tower and label, centred on the slab. */
export const SEAT_SPAN = 2 * (Math.max(...SLOTS.map(({ i, j }) => Math.abs(i - j) * 8)) + 8);

const NEAR: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];

export function levelOf(i: number, j: number) {
  const d = Math.max(Math.abs(i - C), Math.abs(j - C));
  return d < 2.6 ? 2 : d < 5 ? 1 : 0;
}

/** Top vertex of tile (i, j): the diamond spans x0-7..x0+6, y0..y0+7. */
export function tileTop(i: number, j: number): Px {
  return [CX + (i - j) * 8, TOPY + (i + j) * 4 - levelOf(i, j) * STEP];
}

export const CORE: Px = [CX, TOPY + 64 - 2 * STEP];

const inMap = (i: number, j: number) => i >= 0 && j >= 0 && i < N && j < N;
const halfK = (dx: number) => Math.floor(Math.abs(dx + 0.5));

/** Row spans of a size-a iso diamond with top vertex (x, y). */
function diamondRows(x: number, y: number, a: number) {
  const rows: [y: number, from: number, to: number][] = [];
  for (let r = 0; r < a; r++) {
    const k = r < a / 2 ? r : a - 1 - r;
    rows.push([y + r, x - 2 * k - 1, x + 2 * k]);
  }
  return rows;
}

type Edge = "tl" | "tr" | "bl" | "br";

function edgePixels(x: number, y: number, a: number, edge: Edge): Px[] {
  const out: Px[] = [];
  diamondRows(x, y, a).forEach(([py, from, to], r) => {
    const top = r < a / 2;
    if ((edge === "tl" && top) || (edge === "bl" && !top)) out.push([from, py], [from + 1, py]);
    if ((edge === "tr" && top) || (edge === "br" && !top)) out.push([to - 1, py], [to, py]);
  });
  return out;
}

class Canvas {
  readonly data = new Uint8ClampedArray(W * H * 4);
  private cache = new Map<string, [number, number, number]>();
  set(x: number, y: number, hex: string) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    let c = this.cache.get(hex);
    if (!c) this.cache.set(hex, (c = rgb(hex)));
    const o = (y * W + x) * 4;
    this.data[o] = c[0];
    this.data[o + 1] = c[1];
    this.data[o + 2] = c[2];
    this.data[o + 3] = 255;
  }
  pixels(px: Px[], hex: string) {
    for (const [x, y] of px) this.set(x, y, hex);
  }
  diamond(x: number, y: number, a: number, hex: string) {
    for (const [py, from, to] of diamondRows(x, y, a)) for (let px = from; px <= to; px++) this.set(px, py, hex);
  }
  /** Iso box: top diamond at (x, y), faces hanging `depth` px below it. */
  box(x: number, y: number, a: number, depth: number, top: string, left: string, right: string) {
    for (let dx = -(a - 1); dx <= a - 2; dx++) {
      const bottom = y + a - 1 - Math.floor((halfK(dx) + 1) / 2);
      for (let d = 1; d <= depth; d++) this.set(x + dx, bottom + d, dx < 0 ? left : right);
    }
    this.diamond(x, y, a, top);
  }
}

type Territory = { owner: (string | null)[][]; family: Record<string, keyof typeof FAMILY> };

function territory(agents: Agent[], seated: Map<string, Seat>): Territory {
  const seats = agents.flatMap((a) => {
    const s = seated.get(a.id);
    if (!s) return [];
    const reach = a.status === "ruin" ? 1 : 1.5 + Math.sqrt(a.regions) * 0.35;
    return [{ id: a.id, ...s, reach }];
  });
  const owner = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      let best: string | null = null;
      let bestD = 1;
      for (const s of seats) {
        const d = Math.hypot(i - s.i, j - s.j) / s.reach;
        if (d <= bestD) [best, bestD] = [s.id, d];
      }
      return levelOf(i, j) === 2 && Math.max(Math.abs(i - C), Math.abs(j - C)) < 1 ? null : best;
    }),
  );
  const family = Object.fromEntries(agents.map((a) => [a.id, a.status === "ruin" ? "ash" : familyOf(a.accentColor)] as const));
  return { owner, family };
}

export type Scene = {
  agents: Agent[];
  focused: string | null;
  frame: IdleFrame;
  hover?: [number, number] | null | undefined;
  aim?: string[] | undefined;
  flash?: { i: number; j: number; step: number } | null | undefined;
};

export type Anchor = { x: number; y: number; top: number; base: number };

/** Tower geometry per seated agent: base centre, top of tower, base of tile. */
export function anchors(agents: Agent[], seats = seatAgents(agents)): Record<string, Anchor> {
  const height = towerHeights(agents);
  const out: Record<string, Anchor> = {};
  for (const a of agents) {
    const s = seats.get(a.id);
    if (!s) continue;
    const [x, y] = tileTop(s.i, s.j);
    out[a.id] = { x, y: y + 4, top: y + 1 - height(a), base: y + 8 };
  }
  return out;
}

/** Tower height tracks influence relative to the season leader. */
function towerHeights(agents: Agent[]) {
  const peak = Math.max(1, ...agents.map((a) => a.influence));
  return (a: Agent) => (a.status === "ruin" ? 5 : 6 + Math.round((8 * a.influence) / peak));
}

/** Paints one frame of the world into an RGBA buffer of W×H. */
export function paintWorld(scene: Scene): Uint8ClampedArray<ArrayBuffer> {
  const { agents, focused, frame } = scene;
  const cv = new Canvas();
  const seats = seatAgents(agents);
  const height = towerHeights(agents);
  const { owner, family } = territory(agents, seats);
  const tint = (id: string | null) => {
    if (!id) return { top: STONE.base, grid: STONE.shade };
    const ramp = FAMILY[family[id] ?? "ash"];
    const t = focused && focused !== id ? 0.16 : 0.5;
    const top = mix(STONE.base, ramp[1], t);
    return { top, grid: mix(top, ramp[0], 0.4) };
  };

  for (let s = 0; s < 2 * N - 1; s++)
    for (let i = 0; i < N; i++) {
      const j = s - i;
      if (!inMap(i, j)) continue;
      const L = levelOf(i, j);
      const [x, y] = tileTop(i, j);
      const own = owner[i]![j] ?? null;
      const { top, grid } = tint(own);
      cv.box(x, y, 8, L * STEP + PLINTH, top, STONE.shade, STONE.dark);
      const edges: [Edge, number, number, string][] = [["tl", i - 1, j, STONE.light], ["tr", i, j - 1, STONE.light], ["bl", i, j + 1, STONE.rim], ["br", i + 1, j, STONE.rim]];
      for (const [edge, ni, nj, rim] of edges) {
        const back = edge === "tl" || edge === "tr";
        const px = edgePixels(x, y, 8, edge);
        if (!inMap(ni, nj) || levelOf(ni, nj) < L) cv.pixels(px, rim);
        else if (own && owner[ni]![nj] !== own && (!focused || focused === own)) cv.pixels(px, FAMILY[family[own] ?? "ash"][2]);
        else if (back) cv.pixels(px, grid);
      }
    }

  const [cx, cy] = CORE;
  cv.diamond(cx, cy - 3, 6, STONE.deep);
  cv.diamond(cx, cy - 1, 2, "#2ce8f5");
  cv.set(cx - 1, cy - 1, STONE.mint);

  const ring = isoRingPixels(cx, cy, 22, 16, frame);
  cv.pixels(ring.body, { rest: "#0099db", pulse: "#2ce8f5", settle: "#124e89" }[frame]);
  cv.pixels(ring.caps, "#2ce8f5");

  const outline = (i: number, j: number, hex: string) => {
    const [x, y] = tileTop(i, j);
    for (const e of ["tl", "tr", "bl", "br"] as const) cv.pixels(edgePixels(x, y, 8, e), hex);
  };
  if (scene.flash && scene.flash.step < 2) {
    const [x, y] = tileTop(scene.flash.i, scene.flash.j);
    cv.diamond(x, y, 8, scene.flash.step === 0 ? STONE.white : STONE.rim);
  }
  if (scene.hover) outline(scene.hover[0], scene.hover[1], STONE.pulse);
  for (const id of scene.aim ?? []) {
    const s = seats.get(id);
    if (s) outline(s.i, s.j, "#2ce8f5");
  }
  const focusSeat = focused ? seats.get(focused) : undefined;
  if (focusSeat) {
    const [fx, fy] = tileTop(focusSeat.i, focusSeat.j);
    const n = Math.max(Math.abs(fx - cx), Math.abs(fy + 4 - cy));
    for (let k = 0; k <= n; k += 2) cv.set(Math.round(cx + ((fx - cx) * k) / n), Math.round(cy + ((fy + 4 - cy) * k) / n), STONE.pulse);
    outline(focusSeat.i, focusSeat.j, STONE.white);
  }

  type Prop = { depth: number; draw: () => void };
  const props: Prop[] = [];
  const taken = new Set(SLOTS.map((s) => `${s.i},${s.j}`));
  for (const a of agents) {
    const s = seats.get(a.id);
    if (!s) continue;
    const [x, y] = tileTop(s.i, s.j);
    const muted = !!focused && focused !== a.id;
    if (a.status === "ruin") {
      const ash = FAMILY.ash;
      props.push({ depth: s.i + s.j, draw: () => {
        cv.box(x - 2, y + 1, 4, 5, ash[2], ash[1], ash[0]);
        cv.box(x + 3, y + 3, 4, 2, ash[2], ash[1], ash[0]);
        cv.set(x - 3, y + 1, INK);
        cv.set(x + 1, y + 8, ash[1]);
      } });
      continue;
    }
    const cap = muted ? mix(a.accentColor, STONE.mid, 0.6) : a.accentColor;
    const hgt = height(a);
    props.push({ depth: s.i + s.j + 0.5, draw: () => {
      cv.box(x, y + 1 - hgt, 6, hgt, cap, STONE.light, STONE.mid);
      cv.box(x, y + 1 - hgt, 6, 1, cap, mix(cap, INK, 0.2), mix(cap, INK, 0.45));
    } });
    let extra = Math.min(4, Math.floor(a.regions / 4));
    for (const [di, dj] of NEAR) {
      if (extra <= 0) break;
      const ni = s.i + di, nj = s.j + dj;
      if (!inMap(ni, nj) || taken.has(`${ni},${nj}`) || levelOf(ni, nj) === 2 && Math.max(Math.abs(ni - C), Math.abs(nj - C)) < 1) continue;
      taken.add(`${ni},${nj}`);
      extra--;
      const [bx, by] = tileTop(ni, nj);
      props.push({ depth: ni + nj, draw: () => cv.box(bx, by + 1, 4, 3, cap, STONE.light, STONE.mid) });
    }
  }
  props.sort((p, q) => p.depth - q.depth).forEach((p) => p.draw());

  const anchor = focused ? anchors(agents, seats)[focused] : undefined;
  if (anchor) {
    const r = 11.5;
    const ret = ringPixels(anchor.x, (anchor.top + anchor.y) / 2, r, 12, frame);
    cv.pixels(ret.body, { rest: STONE.pulse, pulse: STONE.white, settle: STONE.mid }[frame]);
    cv.pixels(ret.caps, STONE.white);
  }
  return cv.data;
}
