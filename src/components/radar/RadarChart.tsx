"use client";

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
};

const DOT_RADIUS = 14;
const SELECTED_RADIUS = 16;
const SELECTED_STROKE_WIDTH = 3;

const CATEGORY_COLORS: Record<string, string> = {
  Languages: "fill-sky-500",
  "Frameworks & Libraries": "fill-violet-500",
  "Platforms & Tools": "fill-emerald-500",
  Techniques: "fill-amber-500",
};

export default function RadarChart({
  items,
  selectedId,
  onSelect,
}: RadarChartProps) {
  const points = layoutRadar(items);
  const itemById = new Map(items.map((item) => [item.id, item] as const));

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      className="mx-auto mt-8 w-full"
      role="img"
      aria-label="Tech radar"
    >
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
        y1={CENTER - 380}
        x2={CENTER}
        y2={CENTER + 380}
        className="stroke-edge"
        strokeWidth={1}
      />
      <line
        x1={CENTER - 380}
        y1={CENTER}
        x2={CENTER + 380}
        y2={CENTER}
        className="stroke-edge"
        strokeWidth={1}
      />

      {RING_BANDS.map((band) => (
        <text
          key={band.name}
          x={CENTER + 8}
          y={CENTER - band.outer}
          dominantBaseline="central"
          className="fill-muted text-[13px]"
        >
          {band.name}
        </text>
      ))}

      {RADAR_QUADRANTS.map((quadrant) => {
        const bisector = (quadrant.startAngle + quadrant.endAngle) / 2;
        return (
          <text
            key={quadrant.category}
            x={CENTER + 420 * Math.cos(bisector)}
            y={CENTER + 420 * Math.sin(bisector)}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[14px] font-medium"
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

        return (
          <g
            key={point.id}
            onClick={() => onSelect(point.id)}
            className="cursor-pointer"
          >
            <title>{item.name}</title>
            <circle
              cx={point.x}
              cy={point.y}
              r={selected ? SELECTED_RADIUS : DOT_RADIUS}
              strokeWidth={selected ? SELECTED_STROKE_WIDTH : 0}
              className={`${CATEGORY_COLORS[item.category] ?? "fill-zinc-500"} ${
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
  );
}
