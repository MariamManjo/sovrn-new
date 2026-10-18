import { useState } from "react";
import type { Agent } from "@/lib/api/agents";
import { agentFaceUrl } from "./agentFaces";

/** Uploaded square portrait; unassigned or unavailable faces fall back to a pixel face. */
export function AgentAvatar({ agent, size = 64 }: { agent: Agent; size?: number }) {
  const src = agentFaceUrl(agent.id);
  const [failedSrc, setFailedSrc] = useState<string>();
  const dimensions = { width: size, height: size };
  if (!src || failedSrc === src) return <PixelFace agent={agent} size={size} />;
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


/** 16×16 procedural face for agents without a portrait; changes by status. */
function PixelFace({ agent, size = 64 }: { agent: Agent; size?: number }) {
  const { skin, hair, headgear } = agent.look;
  const ruin = agent.status === "ruin";
  const low = agent.status === "low_runway";
  const S = ruin ? "#5a6988" : skin;
  const H = ruin ? "#3a4466" : hair;
  const A = ruin ? "#a22633" : agent.accentColor;
  const px: [number, number, number, number, string][] = [];
  const r = (x: number, y: number, w: number, h: number, c: string) => px.push([x, y, w, h, c]);

  // shoulders / armor in accent
  r(3, 13, 10, 3, A);
  r(6, 13, 4, 1, "#181425");
  // neck + head
  r(7, 11, 2, 2, S);
  r(4, 4, 8, 8, S);
  // hair
  r(4, 3, 8, 2, H);
  r(3, 4, 1, 5, H);
  r(12, 4, 1, 5, H);

  if (headgear === "hood") { r(3, 2, 10, 2, A); r(2, 4, 1, 8, A); r(13, 4, 1, 8, A); }
  if (headgear === "helm") { r(3, 1, 10, 3, "#8b9bb4"); r(7, 0, 2, 1, A); r(4, 4, 8, 1, "#5a6988"); }
  if (headgear === "crown") { r(4, 1, 8, 2, "#feae34"); r(4, 0, 1, 1, "#feae34"); r(7, 0, 2, 1, "#feae34"); r(11, 0, 1, 1, "#feae34"); r(7, 1, 2, 1, A); }
  if (headgear === "band") r(4, 4, 8, 1, A);
  if (headgear === "horns") { r(2, 1, 2, 3, "#ead4aa"); r(12, 1, 2, 3, "#ead4aa"); }

  // eyes
  const E = "#181425";
  if (ruin) {
    // X eyes
    r(5, 6, 1, 1, E); r(7, 6, 1, 1, E); r(6, 7, 1, 1, E); r(5, 8, 1, 1, E); r(7, 8, 1, 1, E);
    r(9, 6, 1, 1, E); r(11, 6, 1, 1, E); r(10, 7, 1, 1, E); r(9, 8, 1, 1, E); r(11, 8, 1, 1, E);
    // crack
    r(8, 4, 1, 2, "#181425"); r(9, 5, 1, 1, "#181425"); r(10, 9, 1, 2, "#181425");
    r(6, 10, 4, 1, E);
  } else if (low) {
    // half-closed, bags
    r(5, 7, 2, 1, E); r(9, 7, 2, 1, E);
    r(5, 8, 2, 1, "#a89f94"); r(9, 8, 2, 1, "#a89f94");
    r(7, 10, 2, 1, E);
  } else {
    const ex = agent.expression;
    r(5, 6, 2, 2, "#ffffff"); r(9, 6, 2, 2, "#ffffff");
    r(ex === "focus" ? 6 : 5, 7, 1, 1, E); r(ex === "focus" ? 10 : 9, 7, 1, 1, E);
    if (ex === "threat") { r(5, 5, 2, 1, H); r(9, 5, 2, 1, H); r(6, 10, 4, 1, E); }
    else if (ex === "focus") r(7, 10, 2, 1, E);
    else { r(6, 10, 1, 1, E); r(7, 11 - 1, 2, 1, E); r(9, 10, 1, 1, E); }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ opacity: low ? 0.8 : 1, filter: ruin ? "grayscale(0.4)" : undefined }}
    >
      {px.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
}
