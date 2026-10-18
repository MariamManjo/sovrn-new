import { FAMILY, STONE, type Family } from "@/lib/sovrn-palette";

/** Swallowtail pixel banner seeded by the alliance name, so every viewer sees the same one. */

const W = 11;
const H = 15;

const CHARGES = [
  ["..#..", ".###.", "#####", ".###.", "..#.."],
  ["..#..", "..#..", "#####", "..#..", "..#.."],
  [".....", "#.#.#", "#####", "#####", "....."],
  ["#.#.#", "#####", ".###.", ".###.", ".###."],
  [".###.", "#...#", "#...#", "#...#", ".###."],
  [".....", ".###.", "#.#.#", ".###.", "....."],
];

function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

// Field rows 1–11, then the swallowtail narrows toward the centre notch.
function inField(x: number, y: number) {
  if (x < 1 || x > 9 || y < 1) return false;
  if (y <= 11) return true;
  const cut = y - 11;
  return y <= 14 && (x <= 5 - cut || x >= 5 + cut);
}

export function allianceFamily(name: string): Family {
  const keys = Object.keys(FAMILY) as Family[];
  return keys[hash(name) % keys.length]!;
}

export function AllianceBanner({ name, scale = 4, fallen = false }: { name: string; scale?: number; fallen?: boolean }) {
  const h = hash(name);
  const [dark, mid, light] = FAMILY[fallen ? "ash" : allianceFamily(name)];
  const split = (h >>> 8) % 4;
  const charge = CHARGES[(h >>> 12) % CHARGES.length]!;
  const cells: { x: number; y: number; c: string }[] = [];

  for (let x = 0; x < W; x++) cells.push({ x, y: 0, c: x === 0 || x === W - 1 ? STONE.shade : STONE.rim });
  for (let y = 1; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inField(x, y)) continue;
      const edge = !inField(x - 1, y) || !inField(x + 1, y) || !inField(x, y + 1);
      const second = split === 1 ? x > 5 : split === 2 ? y > 6 : split === 3 ? y > 2 + Math.abs(x - 5) + 4 : false;
      cells.push({ x, y, c: edge ? dark : second ? dark : mid });
    }
  }
  charge.forEach((row, dy) => [...row].forEach((p, dx) => p === "#" && cells.push({ x: 3 + dx, y: 4 + dy, c: light })));

  return (
    <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" role="img" aria-label={`${name} banner`} className="shrink-0">
      {cells.map(({ x, y, c }, i) => <rect key={i} x={x} y={y} width={1} height={1} fill={c} />)}
    </svg>
  );
}
