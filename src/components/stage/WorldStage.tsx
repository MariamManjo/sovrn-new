import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsQuery } from "@/lib/api/agents";
import { worldMapQuery } from "@/lib/api/world";
import { layout, type Layout } from "@/components/world/world-art";
import { useIdleFrame, useWorldCanvas, useWorldScale } from "@/components/world/use-world";

const NONE: never[] = [];

/** Home backdrop: the live world at whole-number scale, cropped to cover. Decoration only. */
export function WorldStage() {
  const { data: world } = useQuery(worldMapQuery);
  const map = useMemo(() => (world?.regions.length ? layout(world) : null), [world]);
  return map ? <Stage map={map} /> : null;
}

function Stage({ map }: { map: Layout }) {
  const wrap = useRef<HTMLDivElement>(null);
  const { s, ox, oy } = useWorldScale(wrap, "cover", map.w, map.h);
  const frame = useIdleFrame();
  const { data: agents = NONE } = useQuery(agentsQuery);
  const canvas = useWorldCanvas({ agents, map, focused: null, frame });
  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvas} width={map.w} height={map.h} className="pixelated absolute" style={{ left: ox, top: oy, width: map.w * s, height: map.h * s }} />
    </div>
  );
}
