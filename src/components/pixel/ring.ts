/** Logo ring: dashed pixel circle with 4 compass caps; idles rest → pulse (+1px, bright) → settle. */

export const IDLE_MS = { rest: 900, pulse: 250, settle: 350 } as const;
export type IdleFrame = keyof typeof IDLE_MS;
export const IDLE_FRAMES: IdleFrame[] = ["rest", "pulse", "settle"];

export type Px = [x: number, y: number];

const TAU = Math.PI * 2;

/** Body and cap pixels for a frame; centre (cx, cy) is a pixel corner, r is the rest radius. */
export function ringPixels(cx: number, cy: number, r: number, dashes: number, frame: IdleFrame) {
  const R = frame === "pulse" ? r + 1 : r;
  const body: Px[] = [];
  const reach = Math.ceil(R + 1);
  for (let y = Math.floor(cy - reach); y <= Math.ceil(cy + reach); y++)
    for (let x = Math.floor(cx - reach); x <= Math.ceil(cx + reach); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (Math.abs(Math.hypot(dx, dy) - R) >= 0.5) continue;
      if (dashes > 0 && ((Math.atan2(dy, dx) / TAU + 1) * dashes + 0.33) % 1 > 0.66) continue;
      body.push([x, y]);
    }
  const caps: Px[] = [];
  const ticks: Px[] = [];
  const fx = Math.floor(cx), fy = Math.floor(cy) - 1;
  for (const [ux, uy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const at = (d: number): Px => ux === 0 ? [fx, Math.floor(cy + uy * d)] : [Math.floor(cx + ux * d), fy];
    caps.push(at(r + 3));
    if (frame === "pulse") caps.push(at(r + 2));
    else ticks.push(at(r + 1));
  }
  return { body: body.concat(ticks), caps };
}

/** 2:1 iso ellipse ring for ground rings on the map. */
export function isoRingPixels(cx: number, cy: number, rx: number, dashes: number, frame: IdleFrame) {
  const R = frame === "pulse" ? rx + 2 : rx;
  const seen = new Set<string>();
  const body: Px[] = [];
  const steps = Math.ceil(R * 16);
  for (let n = 0; n < steps; n++) {
    const t = (n / steps) * TAU;
    if (dashes > 0 && ((t / TAU) * dashes + 0.31) % 1 > 0.62) continue;
    const p: Px = [Math.floor(cx + R * Math.cos(t)), Math.floor(cy + (R / 2) * Math.sin(t))];
    const k = p.join();
    if (!seen.has(k)) { seen.add(k); body.push(p); }
  }
  const x0 = Math.floor(cx), y0 = Math.floor(cy);
  const h = rx + 5, v = Math.floor(rx / 2) + 3;
  const caps: Px[] = [[x0 - h, y0], [x0 - h + 1, y0], [x0 + h - 2, y0], [x0 + h - 1, y0], [x0 - 1, y0 - v], [x0, y0 - v], [x0 - 1, y0 + v - 1], [x0, y0 + v - 1]];
  return { body, caps };
}

/** Frame at time t (ms) in the shared idle cycle. */
export function idleFrameAt(t: number): IdleFrame {
  const total = IDLE_MS.rest + IDLE_MS.pulse + IDLE_MS.settle;
  const m = t % total;
  return m < IDLE_MS.rest ? "rest" : m < IDLE_MS.rest + IDLE_MS.pulse ? "pulse" : "settle";
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
