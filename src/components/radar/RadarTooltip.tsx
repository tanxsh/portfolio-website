import { RING_SECTIONS } from "@/components/radar/RadarLegend";
import { CENTER, VIEW_SIZE } from "@/lib/radarLayout";
import type { RadarItem } from "@/lib/radarStore";

type RadarTooltipProps = {
  item: RadarItem;
  x: number;
  y: number;
};

export default function RadarTooltip({ item, x, y }: RadarTooltipProps) {
  const ring = RING_SECTIONS.find((entry) => entry.name === item.ring);
  const alignRight = x > CENTER;
  const alignBottom = y > CENTER;

  return (
    <div
      className="pointer-events-none absolute z-10 w-56 rounded-lg border border-edge bg-surface p-4 shadow-md"
      style={{
        left: `${(x / VIEW_SIZE) * 100}%`,
        top: `${(y / VIEW_SIZE) * 100}%`,
        transform: `translate(${
          alignRight ? "calc(-100% - 16px)" : "16px"
        }, ${alignBottom ? "calc(-100% - 16px)" : "16px"})`,
      }}
    >
      <p className="text-sm font-medium text-foreground">{item.name}</p>
      <p className="mt-1 text-xs text-muted">{item.category}</p>
      <p className="mt-1 text-xs text-muted">
        <span className="font-medium text-foreground">{item.ring}</span>
        {ring ? ` — ${ring.description}` : ""}
      </p>
      {item.note.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-muted">{item.note}</p>
      )}
    </div>
  );
}
