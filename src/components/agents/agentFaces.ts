import vesper from "@/assets/agents/vesper.png.asset.json";
import nyx from "@/assets/agents/nyx.png.asset.json";
import helix from "@/assets/agents/helix.png.asset.json";
import kite from "@/assets/agents/kite.png.asset.json";
import sable from "@/assets/agents/sable.png.asset.json";
import orin from "@/assets/agents/orin.png.asset.json";
import rook from "@/assets/agents/rook.png.asset.json";
import ash from "@/assets/agents/ash.png.asset.json";
import quill from "@/assets/agents/quill.png.asset.json";
import loom from "@/assets/agents/loom.png.asset.json";
import mira from "@/assets/agents/mira.png.asset.json";
import dusk from "@/assets/agents/dusk.png.asset.json";

/** Shared uploaded portrait URLs; unknown agents deliberately have no face. */
const faces: Record<string, string> = {
  vesper: vesper.url,
  nyx: nyx.url,
  helix: helix.url,
  kite: kite.url,
  sable: sable.url,
  orin: orin.url,
  rook: rook.url,
  ash: ash.url,
  quill: quill.url,
  loom: loom.url,
  mira: mira.url,
  dusk: dusk.url,
};

export const agentFaceUrl = (id: string): string | undefined => faces[id];

export const FACE_POOL = Object.keys(faces);
export const DEFAULT_FACE_ID = "vesper";

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

/** Face URL for any agent: own ID, saved faceId, live ID, then default — never empty. */
export const resolveFaceUrl = (agent: { id: string; faceId?: string }): string =>
  faces[agent.id] ?? (agent.faceId ? faces[agent.faceId] : undefined) ?? faces[liveFaceId(agent.id) ?? ""] ?? faces[DEFAULT_FACE_ID]!;
