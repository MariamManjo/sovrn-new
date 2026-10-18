import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsQuery } from "@/lib/api/agents";
import { H, W } from "@/components/season/world-art";
import { useIdleFrame, useWorldCanvas, useWorldScale } from "@/components/season/use-world";

const NONE: never[] = [];

/** Home backdrop: the world slab at whole-number scale, cropped to cover. Decoration only. */
export function SeasonStage() {
  const wrap = useRef<HTMLDivElement>(null);
  const { s, ox, oy } = useWorldScale(wrap, "cover");
  const frame = useIdleFrame();
  const { data: agents = NONE } = useQuery(agentsQuery);
  const canvas = useWorldCanvas({ agents, focused: null, frame });
  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvas} width={W} height={H} className="pixelated absolute" style={{ left: ox, top: oy, width: W * s, height: H * s }} />
    </div>
  );
}
