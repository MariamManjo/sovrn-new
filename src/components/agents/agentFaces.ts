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

/** Shared uploaded portrait URLs; agents without one get a procedural pixel face. */
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

// Live playtest ids A0–A11 reuse the portraits in roster order.
const live: Record<string, string> = Object.fromEntries(Object.values(faces).map((url, i) => [`A${i}`, url]));

export const agentFaceUrl = (id: string): string | undefined => faces[id] ?? live[id];
