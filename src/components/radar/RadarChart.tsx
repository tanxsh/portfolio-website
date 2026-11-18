"use client";

import {
  CENTER,
  RADAR_QUADRANTS,
  RING_BANDS,
  VIEW_SIZE,
} from "@/lib/radarLayout";
import type { RadarItem } from "@/lib/radarStore";

type RadarChartProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const LABEL_RADIUS = 420;

export default function RadarChart(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- props are used once dots are drawn
  _props: RadarChartProps,
) {
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
            x={CENTER + LABEL_RADIUS * Math.cos(bisector)}
            y={CENTER + LABEL_RADIUS * Math.sin(bisector)}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[14px] font-medium"
          >
            {quadrant.category}
          </text>
        );
      })}
    </svg>
  );
}
