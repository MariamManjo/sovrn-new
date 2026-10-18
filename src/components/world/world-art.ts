import type { Agent } from "@/lib/api/agents";
import type { Region, WorldMap } from "@/lib/api/world";
import { FAMILY, INK, STONE, familyOf, mix, rgb } from "@/lib/sovrn-palette";
import { isoRingPixels, ringPixels, type IdleFrame, type Px } from "@/components/pixel/ring";

/** The live region map as the logo slab at native resolution; callers blit it at whole-number scale only. */

const STEP = 3;
const PLINTH = 5;
const HEAD = 24;
const PAD = 6;

export type Tile = Region & { i: number; j: number; x: number; y: number; level: number };
export type Layout = { w: number; h: number; tiles: Tile[]; byId: Map<string, Tile>; core: Px };

const hexDist = (q: number, r: number) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;

/** Axial (q, r) sits on iso cell (q, q + r): four hex neighbours share an edge, the other two touch tips. */
export function layout(map: WorldMap): Layout {
  const R = Math.max(1, map.radius);
  const w = 16 * R + 16 + 2 * PAD;
  const h = HEAD + 16 * R + 8 + PLINTH + PAD;
  const cx = w / 2;
  const tiles = map.regions
    .map((g) => {
      const i = g.q, j = g.q + g.r, d = hexDist(g.q, g.r);
      const level = d <= R / 3 ? 2 : d <= (2 * R) / 3 ? 1 : 0;
      return { ...g, i, j, level, x: cx + (i - j) * 8, y: HEAD + (i + j + 2 * R) * 4 - level * STEP };
    })
    .sort((a, b) => a.i + a.j - (b.i + b.j) || a.i - b.i);
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const centre = tiles.find((t) => t.q === 0 && t.r === 0);
  return { w, h, tiles, byId, core: [cx, (centre?.y ?? h / 2) + 4] };
}

/** Row spans of a size-a iso diamond with top vertex (x, y). */
function diamondRows(x: number, y: number, a: number) {
  const rows: [y: number, from: number, to: number][] = [];
  for (let r = 0; r < a; r++) {
    const k = r < a / 2 ? r : a - 1 - r;
    rows.push([y + r, x - 2 * k - 1, x + 2 * k]);
  }
  return rows;
}

const halfK = (dx: number) => Math.floor(Math.abs(dx + 0.5));

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
  readonly data: Uint8ClampedArray<ArrayBuffer>;
  private cache = new Map<string, [number, number, number]>();
  constructor(readonly w: number, readonly h: number) {
    this.data = new Uint8ClampedArray(w * h * 4);
  }
  set(x: number, y: number, hex: string) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    let c = this.cache.get(hex);
    if (!c) this.cache.set(hex, (c = rgb(hex)));
    const o = (y * this.w + x) * 4;
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

export type Scene = {
  agents: Agent[];
  map: Layout;
  focused: string | null;
  frame: IdleFrame;
  hover?: string | null | undefined;
  aim?: string[] | undefined;
  flash?: { id: string; step: number } | null | undefined;
};

export type Anchor = { x: number; y: number; top: number; base: number };

/** Tower height tracks influence relative to the leader. */
function towerHeights(agents: Agent[]) {
  const peak = Math.max(1, ...agents.map((a) => a.influence));
  return (a: Agent) => 6 + Math.round((8 * a.influence) / peak);
}

/** Each living agent's seat: its own capital, else its held region nearest its territory's centre. */
export function seats(agents: Agent[], map: Layout): Map<string, Tile> {
  const out = new Map<string, Tile>();
  for (const a of agents) {
    if (a.status === "ruin") continue;
    const held = map.tiles.filter((t) => t.owner === a.id);
    const own = held.find((t) => t.capital === a.id);
    if (own || !held.length) {
      if (own) out.set(a.id, own);
      continue;
    }
    const mx = held.reduce((n, t) => n + t.x, 0) / held.length, my = held.reduce((n, t) => n + t.y, 0) / held.length;
    out.set(a.id, held.reduce((b, t) => (Math.hypot(t.x - mx, t.y - my) < Math.hypot(b.x - mx, b.y - my) ? t : b)));
  }
  return out;
}

/** Label and focus geometry per seat: base centre, top of its prop, base of tile. */
export function anchors(agents: Agent[], map: Layout, at = seats(agents, map)): Record<string, Anchor> {
  const height = towerHeights(agents);
  const out: Record<string, Anchor> = {};
  for (const a of agents) {
    const t = at.get(a.id);
    if (!t) continue;
    const hgt = t.capital === a.id ? height(a) : 3;
    out[a.id] = { x: t.x, y: t.y + 4, top: t.y + 1 - hgt, base: t.y + 8 };
  }
  return out;
}

const IMPROVEMENT: Record<NonNullable<Region["improvement"]>, readonly [string, string, string]> = {
  farm: [FAMILY.moss[2], FAMILY.moss[1], FAMILY.moss[0]],
  mine: [STONE.shade, STONE.dark, INK],
  market: [FAMILY.ochre[2], FAMILY.ochre[1], FAMILY.ochre[0]],
  fort: [STONE.light, STONE.shade, STONE.dark],
};

/** Paints one frame of the world into an RGBA buffer of map.w × map.h. */
export function paintWorld(scene: Scene): Uint8ClampedArray<ArrayBuffer> {
  const { agents, map, focused, frame } = scene;
  const cv = new Canvas(map.w, map.h);
  const byAgent = new Map(agents.map((a) => [a.id, a]));
  const height = towerHeights(agents);
  const family = (id: string) => FAMILY[familyOf(byAgent.get(id)?.accentColor ?? "#666469")];
  const accent = (id: string) => {
    const c = byAgent.get(id)?.accentColor ?? STONE.mid;
    return focused && focused !== id ? mix(c, STONE.mid, 0.6) : c;
  };
  const cell = new Map(map.tiles.map((t) => [`${t.i},${t.j}`, t]));

  for (const t of map.tiles) {
    const own = t.owner;
    const top = own ? mix(STONE.base, family(own)[1], focused && focused !== own ? 0.16 : 0.5) : STONE.base;
    const grid = own ? mix(top, family(own)[0], 0.4) : STONE.shade;
    cv.box(t.x, t.y, 8, t.level * STEP + PLINTH, top, STONE.shade, STONE.dark);
    const edges: [Edge, number, number, string][] = [["tl", t.i - 1, t.j, STONE.light], ["tr", t.i, t.j - 1, STONE.light], ["bl", t.i, t.j + 1, STONE.rim], ["br", t.i + 1, t.j, STONE.rim]];
    for (const [edge, ni, nj, rim] of edges) {
      const n = cell.get(`${ni},${nj}`);
      const px = edgePixels(t.x, t.y, 8, edge);
      if (!n || n.level < t.level) cv.pixels(px, rim);
      else if (own && n.owner !== own && (!focused || focused === own)) cv.pixels(px, family(own)[2]);
      else if (edge === "tl" || edge === "tr") cv.pixels(px, grid);
    }
    if (t.kind === "gold") cv.set(t.x + 3, t.y + 3, FAMILY.ochre[2]);
    if (t.deposit) cv.set(t.x - 4, t.y + 4, STONE.dark);
  }

  const [cx, cy] = map.core;
  const centre = map.tiles.find((t) => t.q === 0 && t.r === 0);
  if (centre && !centre.owner && !centre.unit && !centre.improvement) {
    cv.diamond(cx, cy - 3, 6, STONE.deep);
    cv.diamond(cx, cy - 1, 2, "#2ce8f5");
    cv.set(cx - 1, cy - 1, STONE.mint);
  }
  const ring = isoRingPixels(cx, cy, 22, 16, frame);
  cv.pixels(ring.body, { rest: "#0099db", pulse: "#2ce8f5", settle: "#124e89" }[frame]);
  cv.pixels(ring.caps, "#2ce8f5");

  const outline = (t: Tile | undefined, hex: string) => {
    if (t) for (const e of ["tl", "tr", "bl", "br"] as const) cv.pixels(edgePixels(t.x, t.y, 8, e), hex);
  };
  if (scene.flash && scene.flash.step < 2) {
    const t = map.byId.get(scene.flash.id);
    if (t) cv.diamond(t.x, t.y, 8, scene.flash.step === 0 ? STONE.white : STONE.rim);
  }
  if (scene.hover) outline(map.byId.get(scene.hover), STONE.pulse);
  const at = seats(agents, map);
  for (const id of scene.aim ?? []) outline(at.get(id), "#2ce8f5");
  if (focused) outline(at.get(focused), STONE.white);

  type Prop = { depth: number; draw: () => void };
  const props: Prop[] = [];
  for (const t of map.tiles) {
    const { x, y } = t;
    const depth = t.i + t.j;
    if (t.capital && !t.owner) {
      const ash = FAMILY.ash;
      props.push({ depth, draw: () => {
        cv.box(x - 2, y + 1, 4, 5, ash[2], ash[1], ash[0]);
        cv.box(x + 3, y + 3, 4, 2, ash[2], ash[1], ash[0]);
        cv.set(x - 3, y + 1, INK);
        cv.set(x + 1, y + 8, ash[1]);
      } });
      continue;
    }
    if (t.capital && t.owner) {
      const owner = byAgent.get(t.owner);
      const cap = accent(t.owner);
      const hgt = owner && t.capital === t.owner ? height(owner) : 6;
      props.push({ depth: depth + 0.5, draw: () => {
        cv.box(x, y + 1 - hgt, 6, hgt, cap, STONE.light, STONE.mid);
        cv.box(x, y + 1 - hgt, 6, 1, cap, mix(cap, INK, 0.2), mix(cap, INK, 0.45));
      } });
      continue;
    }
    if (t.trait === "landmark") {
      props.push({ depth: depth + 0.2, draw: () => {
        for (let k = 0; k < 6; k++) { cv.set(x + 1, y - 2 + k, STONE.white); cv.set(x + 2, y - 2 + k, STONE.shade); }
        cv.set(x + 1, y - 3, STONE.white);
      } });
    }
    const imp = t.improvement ? IMPROVEMENT[t.improvement] : null;
    if (imp) {
      const [top, left, right] = imp;
      const tall = t.improvement === "fort" ? 3 : t.improvement === "farm" ? 1 : 2;
      props.push({ depth: depth + 0.1, draw: () => cv.box(x - 3, y + 2, t.improvement === "fort" ? 4 : 3, tall, top, left, right) });
    }
    if (t.unit) {
      const cap = accent(t.unit);
      props.push({ depth: depth + 0.3, draw: () => cv.box(x + 3, y + 1, 3, 3, cap, mix(cap, INK, 0.2), mix(cap, INK, 0.45)) });
    }
  }
  props.sort((p, q) => p.depth - q.depth).forEach((p) => p.draw());

  const anchor = focused ? anchors(agents, map, at)[focused] : undefined;
  if (anchor) {
    const ret = ringPixels(anchor.x, (anchor.top + anchor.y) / 2, 11.5, 12, frame);
    cv.pixels(ret.body, { rest: STONE.pulse, pulse: STONE.white, settle: STONE.mid }[frame]);
    cv.pixels(ret.caps, STONE.white);
  }
  return cv.data;
}
