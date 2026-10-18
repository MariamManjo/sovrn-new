import { useState } from "react";
import type { Agent } from "@/lib/mock/agents";
import { resolveFaceUrl } from "./agentFaces";

/** Uploaded square portrait; unassigned or unavailable faces use a gray placeholder. */
export function AgentAvatar({ agent, size = 64 }: { agent: Agent; size?: number }) {
  const src = resolveFaceUrl(agent);
  const [failedSrc, setFailedSrc] = useState<string>();
  const dimensions = { width: size, height: size };
  if (!src || failedSrc === src) {
    return <span role="img" aria-label={`${agent.name} face unavailable`} className="block shrink-0 bg-text-mute" style={dimensions} />;
  }
  return (
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
}
