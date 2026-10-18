// Sovrn Caps advances in font px at 12px (glyph + 2px gap); anything unlisted is 9.
const ADVANCE: Record<string, number> = {
  " ": 4, "!": 3, '"': 5, "'": 3, "(": 4, ")": 4, "*": 7, "+": 7, ",": 4, "-": 6, ".": 3, "/": 7,
  "1": 5, ":": 3, ";": 4, "<": 6, "=": 7, ">": 6, I: 3, i: 3, "[": 4, "]": 4, "·": 3, "×": 7,
  "–": 8, "—": 11, "‘": 4, "’": 4, "…": 7,
};

/** Ink width of `text` in CSS px at a multiple of 12px. */
export function capsWidth(text: string, size = 12) {
  const units = [...text].reduce((w, ch) => w + (ADVANCE[ch] ?? 9), 0) - 2;
  return Math.max(0, units) * (size / 12);
}
