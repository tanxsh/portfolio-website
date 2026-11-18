"use client";

import RadarTooltip from "@/components/radar/RadarTooltip";
import {
  CENTER,
  RADAR_QUADRANTS,
  RING_BANDS,
  VIEW_SIZE,
  layoutRadar,
} from "@/lib/radarLayout";
import type { RadarItem } from "@/lib/radarStore";

type RadarChartProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  selectedCategory: string;
};

const CHART_RADIUS = RING_BANDS[RING_BANDS.length - 1].outer;
const DOT_RADIUS = 14;
const SELECTED_RADIUS = 16;
const SELECTED_STROKE_WIDTH = 3;

const CATEGORY_COLORS: Record<string, { fill: string; tint: string }> = {
  Languages: {
    fill: "fill-sky-600 dark:fill-sky-400",
    tint: "fill-sky-500/10",
  },
  "Frameworks & Libraries": {
    fill: "fill-violet-600 dark:fill-violet-400",
    tint: "fill-violet-500/10",
  },
  "Platforms & Tools": {
    fill: "fill-emerald-600 dark:fill-emerald-400",
    tint: "fill-emerald-500/10",
  },
  Techniques: {
    fill: "fill-amber-600 dark:fill-amber-400",
    tint: "fill-amber-500/10",
  },
};

const QUADRANT_CORNERS: Record<
  string,
  { x: number; y: number; anchor: "start" | "end" }
> = {
  Languages: { x: 24, y: 32, anchor: "start" },
  "Frameworks & Libraries": { x: VIEW_SIZE - 24, y: 32, anchor: "end" },
  "Platforms & Tools": { x: VIEW_SIZE - 24, y: VIEW_SIZE - 32, anchor: "end" },
  Techniques: { x: 24, y: VIEW_SIZE - 32, anchor: "start" },
};

function wedgePath(quadrant: (typeof RADAR_QUADRANTS)[number]): string {
  const x1 = CENTER + CHART_RADIUS * Math.cos(quadrant.startAngle);
  const y1 = CENTER + CHART_RADIUS * Math.sin(quadrant.startAngle);
  const x2 = CENTER + CHART_RADIUS * Math.cos(quadrant.endAngle);
  const y2 = CENTER + CHART_RADIUS * Math.sin(quadrant.endAngle);
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${CHART_RADIUS} ${CHART_RADIUS} 0 0 1 ${x2} ${y2} Z`;
}

export default function RadarChart({
  items,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  selectedCategory,
}: RadarChartProps) {
  const points = layoutRadar(items);
  const itemById = new Map(items.map((item) => [item.id, item] as const));
  const hoveredPoint = hoveredId
    ? points.find((point) => point.id === hoveredId)
    : undefined;
  const hoveredItem = hoveredPoint
    ? itemById.get(hoveredPoint.id)
    : undefined;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className="mx-auto w-full"
        role="img"
        aria-label="Tech radar"
      >
      {RADAR_QUADRANTS.map((quadrant) => (
        <path
          key={quadrant.category}
          d={wedgePath(quadrant)}
          className={CATEGORY_COLORS[quadrant.category]?.tint ?? "fill-zinc-500/10"}
        />
      ))}

      {RING_BANDS.map((band) => (
        <circle
          key={band.name}
          cx={CENTER}
          cy={CENTER}
          r={band.outer}
          fill="none"
          className="stroke-edge"
          strokeWidth={1.5}
        />
      ))}

      <line
        x1={CENTER}
        y1={CENTER - CHART_RADIUS}
        x2={CENTER}
        y2={CENTER + CHART_RADIUS}
        className="stroke-edge"
        strokeWidth={1}
      />
      <line
        x1={CENTER - CHART_RADIUS}
        y1={CENTER}
        x2={CENTER + CHART_RADIUS}
        y2={CENTER}
        className="stroke-edge"
        strokeWidth={1}
      />

      {RING_BANDS.map((band) => {
        const labelWidth = band.name.length * 9.5 + 16;

        return (
          <g key={band.name}>
            <rect
              x={CENTER - labelWidth / 2}
              y={CENTER - band.outer - 12}
              width={labelWidth}
              height={24}
              rx={12}
              className="fill-surface stroke-edge"
              strokeWidth={1}
            />
            <text
              x={CENTER}
              y={CENTER - band.outer}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[16px] font-medium"
            >
              {band.name}
            </text>
          </g>
        );
      })}

      {RADAR_QUADRANTS.map((quadrant) => {
        const corner = QUADRANT_CORNERS[quadrant.category];

        return (
          <text
            key={quadrant.category}
            x={corner.x}
            y={corner.y}
            textAnchor={corner.anchor}
            dominantBaseline="central"
            className={`${CATEGORY_COLORS[quadrant.category]?.fill ?? "fill-foreground"} text-[20px] font-semibold`}
          >
            {quadrant.category}
          </text>
        );
      })}

        {points.map((point) => {
          const item = itemById.get(point.id);
          if (!item) {
            return null;
          }

          const selected = point.id === selectedId;
          const dimmed =
            (hoveredId !== null && hoveredId !== point.id) ||
            (selectedCategory !== "All" &&
              item.category !== selectedCategory);

          return (
            <g
              key={point.id}
              tabIndex={0}
              onMouseEnter={() => onHover(point.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(point.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(point.id)}
              className={`cursor-pointer transition-opacity ${
                dimmed ? "opacity-40" : ""
              }`}
            >
              <title>{item.name}</title>
              <circle
                cx={point.x}
                cy={point.y}
                r={selected ? SELECTED_RADIUS : DOT_RADIUS}
                strokeWidth={selected ? SELECTED_STROKE_WIDTH : 0}
                className={`${CATEGORY_COLORS[item.category]?.fill ?? "fill-zinc-500"} ${
                  selected ? "stroke-foreground" : ""
                }`}
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none fill-white text-[12px] font-semibold"
              >
                {point.number}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredPoint && hoveredItem && (
        <RadarTooltip
          item={hoveredItem}
          x={hoveredPoint.x}
          y={hoveredPoint.y}
        />
      )}
    </div>
  );
}
