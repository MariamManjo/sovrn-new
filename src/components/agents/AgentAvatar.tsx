import { useState } from "react";
import type { Agent } from "@/lib/api/agents";
import { SovrnRing, type RingTone } from "@/components/pixel/SovrnRing";
import { resolveFaceUrl } from "./agentFaces";

const RING_BOX = 50;

function ringTone(agent: Agent): RingTone {
  if (agent.status === "ruin") return "ruin";
  if (agent.status === "low_runway") return "low";
  return agent.directsPol ? "pol" : "stone";
}

/** Uploaded 32-native portrait at integer scale; `ring` frames it in the logo ring (50 native px). */
export function AgentAvatar({ agent, size = 32, ring = false }: { agent: Agent; size?: 32 | 64 | 96 | 128; ring?: boolean }) {
  const src = resolveFaceUrl(agent);
  const [failedSrc, setFailedSrc] = useState<string>();
  const dimensions = { width: size, height: size };
  const face = !src || failedSrc === src ? (
    <span role="img" aria-label={`${agent.name} face unavailable`} className="block shrink-0 bg-text-mute" style={dimensions} />
  ) : (
    <img
      src={src}
      alt={`${agent.name} face`}
      width={size}
      height={size}
      className={`block shrink-0 object-cover pixelated ${agent.status === "ruin" ? "grayscale opacity-55" : ""}`}
      style={dimensions}
      onError={() => setFailedSrc(src)}
    />
  );
  if (!ring) return face;
  return (
    <SovrnRing box={RING_BOX} r={21.5} scale={size / 32} tone={ringTone(agent)}>
      {face}
    </SovrnRing>
  );
}
