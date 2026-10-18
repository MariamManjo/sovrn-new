/** Local portrait pool — files in /public/faces (from Desktop SOVRN Face idle.png set). */

const FACE_IDS = [
  "vesper",
  "nyx",
  "helix",
  "kite",
  "sable",
  "orin",
  "rook",
  "ash",
  "quill",
  "loom",
  "mira",
  "dusk",
] as const;

export type FaceId = (typeof FACE_IDS)[number];

const faces: Record<string, string> = Object.fromEntries(
  FACE_IDS.map((id) => [id, `/faces/${id}.png`]),
);

export const agentFaceUrl = (id: string): string | undefined => faces[id];

export const FACE_POOL = [...FACE_IDS];
export const DEFAULT_FACE_ID: FaceId = "vesper";

/** Deterministic face for a new agent: exact demo-name match, else hash(name + ticker). */
export function pickFaceId(name: string, ticker: string): string {
  const n = name.trim().toLowerCase();
  if (faces[n]) return n;
  let h = 0;
  for (const c of n + "|" + ticker.toUpperCase()) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return FACE_POOL[h % FACE_POOL.length] ?? DEFAULT_FACE_ID;
}

// Live playtest ids (A0, A1, …) cycle through the pool in roster order.
const liveFaceId = (id: string) => (/^A\d+$/.test(id) ? FACE_POOL[+id.slice(1) % FACE_POOL.length] : undefined);

/** Face URL for any agent: own ID, saved faceId, name match, live ID, then hash — never empty. */
export const resolveFaceUrl = (agent: { id: string; faceId?: string; name?: string; ticker?: string }): string => {
  const byName = agent.name ? faces[agent.name.trim().toLowerCase()] : undefined;
  const byHash = agent.name && agent.ticker ? faces[pickFaceId(agent.name, agent.ticker)] : undefined;
  return (
    faces[agent.id] ??
    (agent.faceId ? faces[agent.faceId] : undefined) ??
    byName ??
    faces[liveFaceId(agent.id) ?? ""] ??
    byHash ??
    faces[DEFAULT_FACE_ID]!
  );
};
