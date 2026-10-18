import gardenAsset from "@/assets/garden-old.png.asset.json";
import type { Layout } from "./world-art";

/** The painted garden is the single source of map art: callers blit it contained —
 *  never cropped — and align interaction overlays through `surfaceFit`. */

export const GARDEN = gardenAsset;
export const GARDEN_W = 1920;
export const GARDEN_H = 1170;

/** Island surface corners measured from the artwork, in image pixels. */
const L: [number, number] = [174, 650];
const T: [number, number] = [956, 265];
const R: [number, number] = [1738, 682];
const B: [number, number] = [956, 1093];

/** Homography from the unit surface diamond — corners L(0,½) T(½,0) R(1,½) B(½,1) —
 *  onto the measured artwork corners. Solved offline from those four pairs. */
const H: readonly [number, number, number][] = [
  [1516.384, -58.21077, 197.808],
  [31.02576, 761.4473, 249.4871],
  [0, -0.06088993, 1],
];

/** Maps world-canvas coordinates onto the artwork: the layout's surface-diamond
 *  extents are normalised to the unit diamond, then placed by the homography. */
export function surfaceFit(map: Layout) {
  const xs = map.tiles.map((t) => t.x);
  const ys = map.tiles.map((t) => t.y + t.level * 3); // raised centre tiles flattened back
  const minX = Math.min(...xs) - 8, maxX = Math.max(...xs) + 8;
  const minY = Math.min(...ys), maxY = Math.max(...ys) + 8;
  const to = (x: number, y: number): [number, number] => {
    const u = (x - minX) / (maxX - minX);
    const v = (y - minY) / (maxY - minY);
    const d = 1 + H[2][1]! * v;
    return [(H[0][0]! * u + H[0][1]! * v + H[0][2]!) / d, (H[1][0]! * u + H[1][1]! * v + H[1][2]!) / d];
  };
  return { to };
}
