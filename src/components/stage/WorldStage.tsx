import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsQuery } from "@/lib/api/agents";
import { worldMapQuery } from "@/lib/api/world";
import { layout, type Layout } from "@/components/world/world-art";
import { useIdleFrame, useWorldCanvas, useWorldScale } from "@/components/world/use-world";

const NONE: never[] = [];

/** Home backdrop: live world + dense space field so black margins aren’t empty holes. */
export function WorldStage() {
  const { data: world } = useQuery(worldMapQuery);
  const map = useMemo(() => (world?.regions.length ? layout(world) : null), [world]);
  return map ? <Stage map={map} /> : null;
}

function Stage({ map }: { map: Layout }) {
  const wrap = useRef<HTMLDivElement>(null);
  const { s, ox, oy } = useWorldScale(wrap, "fit", map.w, map.h, 0.9);
  const frame = useIdleFrame();
  const { data: agents = NONE } = useQuery(agentsQuery);
  const canvas = useWorldCanvas({ agents, map, focused: null, frame });
  const mw = map.w * s;
  const mh = map.h * s;
  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden bg-[#05070c]" aria-hidden>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1.4px 1.4px at 10% 20%, #6a7a8a 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, #3d4f63 0%, transparent 100%), radial-gradient(1.2px 1.2px at 80% 25%, #5a6a7a 0%, transparent 100%), radial-gradient(1px 1px at 60% 85%, #2ce8f555 0%, transparent 100%), radial-gradient(circle, #1e2a36 0.55px, transparent 0.65px)",
          backgroundSize: "90px 90px, 140px 140px, 110px 110px, 200px 200px, 14px 14px",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: Math.max(mw, mh) * 1.25,
          height: Math.max(mw, mh) * 0.62,
          background: "radial-gradient(ellipse at center, rgba(0,153,219,0.18) 0%, rgba(5,7,12,0) 70%)",
        }}
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <ellipse cx="50%" cy="52%" rx="46%" ry="38%" fill="none" stroke="#2ce8f5" strokeOpacity="0.28" strokeWidth="1.25" strokeDasharray="6 14" />
        <ellipse cx="50%" cy="52%" rx="38%" ry="30%" fill="none" stroke="#8b9bb4" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 11" />
        <ellipse cx="50%" cy="52%" rx="28%" ry="22%" fill="none" stroke="#2ce8f5" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 9" />
      </svg>
      <canvas
        ref={canvas}
        width={map.w}
        height={map.h}
        className="pixelated absolute"
        style={{ left: ox, top: oy, width: mw, height: mh }}
      />
    </div>
  );
}
