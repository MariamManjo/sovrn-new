import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { IDLE_FRAMES, IDLE_MS, prefersReducedMotion, type IdleFrame } from "@/components/pixel/ring";
import { H, SEAT_SPAN, W, paintWorld, type Scene } from "./world-art";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Shared ring idle; reduced motion holds the rest frame. */
export function useIdleFrame(): IdleFrame {
  const [frame, setFrame] = useState<IdleFrame>("rest");
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let n = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      n = (n + 1) % IDLE_FRAMES.length;
      const next = IDLE_FRAMES[n]!;
      setFrame(next);
      t = setTimeout(tick, IDLE_MS[next]);
    };
    t = setTimeout(tick, IDLE_MS.rest);
    return () => clearTimeout(t);
  }, []);
  return frame;
}

/** Whole-number scale for the native world: floor to fit, or ceil to cover. */
export function useWorldScale(ref: RefObject<HTMLElement | null>, mode: "fit" | "cover") {
  const [box, setBox] = useState({ w: W * 3, h: H * 3 });
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  let s = mode === "fit"
    ? Math.max(1, Math.floor(Math.min(box.w / W, box.h / H)))
    : Math.max(1, Math.ceil(Math.max(box.w / W, box.h / H)));
  // Phones: 2× with the slab tips cropped beats an unlabelled 1×; every seat stays in view.
  if (mode === "fit" && s === 1 && box.w >= SEAT_SPAN * 2 && box.h >= H * 2) s = 2;
  return { s, w: box.w, h: box.h, ox: Math.floor((box.w - W * s) / 2), oy: Math.floor((box.h - H * s) / 2) };
}

/** Paints the scene into a native-size canvas whenever it changes. */
export function useWorldCanvas(scene: Scene) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { agents, focused, frame, hover, aim, flash } = scene;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(new ImageData(paintWorld({ agents, focused, frame, hover, aim, flash }), W, H), 0, 0);
  }, [agents, focused, frame, hover, aim, flash]);
  return ref;
}
