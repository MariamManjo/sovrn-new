/** Three colour tiers: logo stone for land, muted ref families for territory and avatars, UI brights for state only. */

export const STONE = {
  deep: "#273a35",
  dark: "#364543",
  shade: "#6a7b77",
  base: "#7f938a",
  mid: "#8b9c98",
  rim: "#b7c6bf",
  light: "#c3d0cb",
  pulse: "#dee6e2",
  white: "#eff5f1",
  mint: "#b4f0d7",
} as const;

export const INK = "#181425";

export type Ramp = readonly [dark: string, mid: string, light: string];

export const FAMILY = {
  navy: ["#243853", "#477ab3", "#9ebdd1"],
  teal: ["#283b3f", "#617478", "#9eb4b2"],
  moss: ["#293d32", "#607554", "#a0aa78"],
  plum: ["#302138", "#673f73", "#a8658e"],
  violet: ["#292536", "#55446e", "#8a759e"],
  oxide: ["#382c30", "#754440", "#ae6350"],
  rust: ["#5e4133", "#946b4d", "#bb9066"],
  ochre: ["#443a31", "#88644a", "#b69a59"],
  sand: ["#5e5246", "#b3a58b", "#d7ccb0"],
  ash: ["#34323d", "#666469", "#9b9595"],
  taupe: ["#302930", "#89756a", "#ac9180"],
} as const satisfies Record<string, Ramp>;

export type Family = keyof typeof FAMILY;

const BY_ACCENT: Record<string, Family> = {
  "#0099db": "navy",
  "#124e89": "navy",
  "#2ce8f5": "teal",
  "#63c74d": "moss",
  "#b55088": "plum",
  "#68386c": "violet",
  "#e43b44": "oxide",
  "#a22633": "ash",
  "#f77622": "rust",
  "#feae34": "ochre",
  "#ead4aa": "sand",
  "#c28569": "taupe",
};

/** Muted family for a bright accent; unknown accents fall back by hue. */
export function familyOf(accent: string): Family {
  const hit = BY_ACCENT[accent.toLowerCase()];
  if (hit) return hit;
  const [r, g, b] = rgb(accent);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max - min < 24) return "ash";
  const h = max === r ? ((g - b) / (max - min) + 6) % 6 : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
  return (["oxide", "ochre", "moss", "teal", "navy", "plum"] as const)[Math.floor(h + 0.5) % 6] ?? "ash";
}

export const SKIN_RAMPS: Record<string, Ramp> = {
  "#e8b796": ["#a87759", "#d19c72", "#e0b58a"],
  "#c28569": ["#946b4d", "#b68867", "#d4ad84"],
  "#b86f50": ["#88644a", "#ac7652", "#be906e"],
  "#733e39": ["#5e4133", "#765544", "#a27c65"],
};

export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: string, b: string, t: number): string {
  const x = rgb(a), y = rgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Dark/mid/light ramp around an arbitrary colour, for hair and caps. */
export function rampOf(hex: string): Ramp {
  return [mix(hex, INK, 0.45), hex, mix(hex, "#ffffff", 0.28)];
}
