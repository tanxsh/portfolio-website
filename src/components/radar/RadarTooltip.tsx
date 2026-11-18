import { RING_SECTIONS } from "@/components/radar/RadarLegend";
import { CATEGORY_STYLES } from "@/components/radar/categoryStyles";
import { CENTER, VIEW_SIZE } from "@/lib/radarLayout";
import type { RadarItem } from "@/lib/radarStore";

type RadarTooltipProps = {
  item: RadarItem;
  x: number;
  y: number;
};

const tooltipCss = `
@keyframes radar-tooltip-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes radar-leader-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.radar-tooltip-card {
  animation: radar-tooltip-in 0.15s ease-out both;
}
.radar-tooltip-leader {
  animation: radar-leader-in 0.15s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .radar-tooltip-card,
  .radar-tooltip-leader {
    animation: none;
  }
}
`;

export default function RadarTooltip({ item, x, y }: RadarTooltipProps) {
  const ring = RING_SECTIONS.find((entry) => entry.name === item.ring);
  const alignRight = x > CENTER;
  const alignBottom = y > CENTER;
  const style = CATEGORY_STYLES[item.category];
  const badge = style?.badge ?? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400";
  const bar = style?.bar ?? "bg-zinc-500";
  const lineColor = style?.glow ?? "#71717a";

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${(x / VIEW_SIZE) * 100}%`,
        top: `${(y / VIEW_SIZE) * 100}%`,
      }}
    >
      <style>{tooltipCss}</style>

      <svg
        width={0}
        height={0}
        aria-hidden="true"
        className="radar-tooltip-leader pointer-events-none absolute left-0 top-0 overflow-visible"
      >
        <line
          x1={0}
          y1={0}
          x2={alignRight ? -16 : 16}
          y2={alignBottom ? -16 : 16}
          stroke={lineColor}
          strokeWidth={1.5}
        />
      </svg>

      <div
        className="absolute"
        style={{
          transform: `translate(${
            alignRight ? "calc(-100% - 16px)" : "16px"
          }, ${alignBottom ? "calc(-100% - 16px)" : "16px"})`,
        }}
      >
        <div
          className="radar-tooltip-card pointer-events-none relative w-56 overflow-hidden rounded-xl border border-edge bg-surface/70 shadow-lg backdrop-blur-md"
          style={{
            transformOrigin: `${alignRight ? "right" : "left"} ${
              alignBottom ? "bottom" : "top"
            }`,
          }}
        >
          <span
            className={`absolute inset-y-0 left-0 w-1 ${bar}`}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1.5 p-3.5 pl-4">
            <p className="text-base font-semibold text-foreground">
              {item.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge}`}
              >
                {item.category}
              </span>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                {item.ring}
              </span>
            </div>
            {ring && <p className="text-xs text-muted">{ring.description}</p>}
            {item.note.length > 0 && (
              <p className="text-xs leading-5 text-muted">{item.note}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
