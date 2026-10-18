import { GARDEN, GARDEN_W, GARDEN_H } from "@/components/world/garden";

/** Home backdrop: the painted garden, contained whole with starfield padding. Decoration only. */
export function WorldStage() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={GARDEN.url}
        alt=""
        width={GARDEN_W}
        height={GARDEN_H}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "88%", height: "88%", objectFit: "contain" }}
      />
    </div>
  );
}
