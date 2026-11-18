"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import RadarTooltip from "@/components/radar/RadarTooltip";
import { CATEGORY_STYLES } from "@/components/radar/categoryStyles";
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

const QUADRANT_CORNERS: Record<
  string,
  { x: number; y: number; anchor: "start" | "end" }
> = {
  Languages: { x: 24, y: 32, anchor: "start" },
  "Frameworks & Libraries": { x: VIEW_SIZE - 24, y: 32, anchor: "end" },
  "Platforms & Tools": { x: VIEW_SIZE - 24, y: VIEW_SIZE - 32, anchor: "end" },
  Techniques: { x: 24, y: VIEW_SIZE - 32, anchor: "start" },
};

const RING_STROKE_OPACITY = [0.16, 0.14, 0.12] as const;
const RING_STAGGER_SECONDS = 0.15;
const DOT_STAGGER_SECONDS = 0.025;
const SWEEP_ANGLE = (40 * Math.PI) / 180;

const animationCss = `
@keyframes radar-ring-draw {
  from { stroke-dashoffset: var(--ring-circumference); }
  to { stroke-dashoffset: 0; }
}
@keyframes radar-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.radar-ring {
  animation: radar-ring-draw 0.9s ease-out both;
}
.radar-fade {
  animation: radar-fade-in 0.9s ease-out both;
}
.radar-dot {
  transform-box: fill-box;
  transform-origin: center;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}
.radar-dot:hover,
.radar-dot:focus {
  transform: scale(1.3);
}
.radar-dot-circle {
  filter: drop-shadow(0 0 4px var(--dot-glow-c));
}
.radar-dot:hover .radar-dot-circle,
.radar-dot:focus .radar-dot-circle {
  filter:
    drop-shadow(0 0 9px var(--dot-glow-c))
    drop-shadow(0 0 4px var(--dot-glow-c));
}
.radar-dot-in {
  animation: radar-dot-in 0.35s ease-out backwards;
}
@keyframes radar-dot-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.radar-halo {
  animation: radar-halo 3s ease-in-out infinite;
}
@keyframes radar-halo {
  0%,
  100% {
    opacity: 0.12;
  }
  50% {
    opacity: 0.4;
  }
}
.radar-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: radar-ripple 2s ease-out infinite;
}
@keyframes radar-ripple {
  from {
    transform: scale(1);
    opacity: 0.7;
  }
  to {
    transform: scale(2);
    opacity: 0;
  }
}
.radar-sweep {
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .radar-ring,
  .radar-fade,
  .radar-dot-in,
  .radar-halo,
  .radar-ripple {
    animation: none;
  }
  .radar-sweep {
    opacity: 0;
  }
}
`;

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
  const activeId = hoveredId ?? selectedId;
  const activePoint = activeId
    ? points.find((point) => point.id === activeId)
    : undefined;
  const activeItem = activePoint ? itemById.get(activePoint.id) : undefined;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      setReducedMotion(query.matches);
    }

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    if (hoveredId !== null) {
      svg.pauseAnimations();
    } else {
      svg.unpauseAnimations();
    }
  }, [hoveredId]);

  const ticks = Array.from({ length: 24 }, (_, index) => {
    const angle = (index * Math.PI) / 12;
    return {
      x1: CENTER + CHART_RADIUS * Math.cos(angle),
      y1: CENTER + CHART_RADIUS * Math.sin(angle),
      x2: CENTER + (CHART_RADIUS + 10) * Math.cos(angle),
      y2: CENTER + (CHART_RADIUS + 10) * Math.sin(angle),
    };
  });

  return (
    <div className="relative">
      <style>{animationCss}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className="mx-auto w-full"
        role="img"
        aria-label="Tech radar"
      >
        <defs>
          <radialGradient id="radar-disc" gradientUnits="userSpaceOnUse" cx={CENTER} cy={CENTER} r={CHART_RADIUS}>
            <stop offset="0%" style={{ stopColor: "var(--surface)" }} />
            <stop offset="100%" style={{ stopColor: "var(--background)" }} />
          </radialGradient>

          {RADAR_QUADRANTS.map((quadrant) => {
            const color = CATEGORY_STYLES[quadrant.category]?.glow ?? "#71717a";
            return (
              <radialGradient
                key={quadrant.category}
                id={`radar-wedge-${RADAR_QUADRANTS.indexOf(quadrant)}`}
                gradientUnits="userSpaceOnUse"
                cx={CENTER}
                cy={CENTER}
                r={CHART_RADIUS}
              >
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.015 }} />
              </radialGradient>
            );
          })}

          {RADAR_QUADRANTS.map((quadrant) => {
            const colors = CATEGORY_STYLES[quadrant.category];
            return (
              <radialGradient
                key={quadrant.category}
                id={`radar-dot-fill-${RADAR_QUADRANTS.indexOf(quadrant)}`}
                cx="0.35"
                cy="0.3"
                r="0.85"
              >
                <stop offset="0%" style={{ stopColor: colors?.light ?? "#a1a1aa" }} />
                <stop offset="100%" style={{ stopColor: colors?.base ?? "#3f3f46" }} />
              </radialGradient>
            );
          })}

          <linearGradient id="radar-axis-v" gradientUnits="userSpaceOnUse" x1={CENTER} y1={CENTER - CHART_RADIUS} x2={CENTER} y2={CENTER + CHART_RADIUS}>
            <stop offset="0%" style={{ stopColor: "var(--foreground)", stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: "var(--foreground)", stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: "var(--foreground)", stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="radar-axis-h" gradientUnits="userSpaceOnUse" x1={CENTER - CHART_RADIUS} y1={CENTER} x2={CENTER + CHART_RADIUS} y2={CENTER}>
            <stop offset="0%" style={{ stopColor: "var(--foreground)", stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: "var(--foreground)", stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: "var(--foreground)", stopOpacity: 0 }} />
          </linearGradient>

          <linearGradient id="radar-sweep" gradientUnits="userSpaceOnUse" x1={CENTER + CHART_RADIUS} y1={CENTER} x2={CENTER + CHART_RADIUS * Math.cos(SWEEP_ANGLE)} y2={CENTER + CHART_RADIUS * Math.sin(SWEEP_ANGLE)}>
            <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.12 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
          </linearGradient>

          <filter id="radar-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={CHART_RADIUS}
          fill="url(#radar-disc)"
        />

        {RADAR_QUADRANTS.map((quadrant) => (
          <path
            key={quadrant.category}
            d={wedgePath(quadrant)}
            fill={`url(#radar-wedge-${RADAR_QUADRANTS.indexOf(quadrant)})`}
          />
        ))}

        <g className="radar-sweep" aria-hidden="true">
          <path
            d={`M ${CENTER} ${CENTER} L ${CENTER + CHART_RADIUS} ${CENTER} A ${CHART_RADIUS} ${CHART_RADIUS} 0 0 1 ${CENTER + CHART_RADIUS * Math.cos(SWEEP_ANGLE)} ${CENTER + CHART_RADIUS * Math.sin(SWEEP_ANGLE)} Z`}
            fill="url(#radar-sweep)"
          />
          {!reducedMotion && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CENTER} ${CENTER}`}
              to={`360 ${CENTER} ${CENTER}`}
              dur="14s"
              repeatCount="indefinite"
            />
          )}
        </g>

        {RING_BANDS.map((band, index) => {
          const delay = `${index * RING_STAGGER_SECONDS}s`;
          const isOutermost = index === RING_BANDS.length - 1;
          const circumference = 2 * Math.PI * band.outer;

          if (isOutermost) {
            return (
              <circle
                key={band.name}
                cx={CENTER}
                cy={CENTER}
                r={band.outer}
                fill="none"
                strokeDasharray="6 8"
                className="radar-fade stroke-foreground"
                style={{ animationDelay: delay }}
                strokeOpacity={0.2}
                strokeWidth={1.5}
              />
            );
          }

          return (
            <g key={band.name}>
              {index === 0 && (
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={band.outer}
                  fill="none"
                  className="radar-fade stroke-accent"
                  style={{ animationDelay: delay }}
                  strokeOpacity={0.35}
                  strokeWidth={2}
                  filter="url(#radar-glow)"
                />
              )}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={band.outer}
                fill="none"
                className="radar-ring stroke-foreground"
                style={
                  {
                    animationDelay: delay,
                    "--ring-circumference": `${circumference}`,
                  } as CSSProperties
                }
                strokeDasharray={`${circumference}`}
                strokeOpacity={RING_STROKE_OPACITY[index]}
                strokeWidth={1}
              />
            </g>
          );
        })}

        <line
          x1={CENTER}
          y1={CENTER - CHART_RADIUS}
          x2={CENTER}
          y2={CENTER + CHART_RADIUS}
          stroke="url(#radar-axis-v)"
          strokeWidth={1}
        />
        <line
          x1={CENTER - CHART_RADIUS}
          y1={CENTER}
          x2={CENTER + CHART_RADIUS}
          y2={CENTER}
          stroke="url(#radar-axis-h)"
          strokeWidth={1}
        />

        {ticks.map((tick, index) => (
          <line
            key={`tick-${index}`}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            className="stroke-foreground"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        ))}

        {RING_BANDS.map((band) => {
          const labelWidth = band.name.length * 12 + 18;

          return (
            <g key={band.name}>
              <rect
                x={CENTER - labelWidth / 2}
                y={CENTER - band.outer - 15}
                width={labelWidth}
                height={30}
                rx={15}
                className="fill-surface stroke-edge"
                fillOpacity={0.7}
                strokeWidth={1}
              />
              <text
                x={CENTER}
                y={CENTER - band.outer}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-[20px] font-medium"
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
              className={`${CATEGORY_STYLES[quadrant.category]?.labelText ?? "fill-foreground"} text-[24px] font-semibold`}
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

          const categoryIndex = RADAR_QUADRANTS.findIndex(
            (quadrant) => quadrant.category === item.category,
          );
          const glowColor =
            CATEGORY_STYLES[item.category]?.glow ?? "#71717a";
          const selected = point.id === selectedId;
          const dimmedByActivity = activeId !== null && point.id !== activeId;
          const dimmedByCategory =
            selectedCategory !== "All" &&
            item.category !== selectedCategory;

          return (
            <g
              key={point.id}
              tabIndex={0}
              data-radar-item=""
              onMouseEnter={() => onHover(point.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(point.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(point.id)}
              className={`radar-dot radar-dot-in cursor-pointer ${
                dimmedByActivity
                  ? "opacity-20"
                  : dimmedByCategory
                    ? "opacity-40"
                    : ""
              }`}
              style={
                {
                  animationDelay: `${(point.number - 1) * DOT_STAGGER_SECONDS}s`,
                  "--dot-glow-c": glowColor,
                } as CSSProperties
              }
            >
              <title>{item.name}</title>
              {item.ring === "Adopt" && (
                <circle
                  className="radar-halo"
                  cx={point.x}
                  cy={point.y}
                  r={20}
                  fill={`url(#radar-dot-fill-${Math.max(categoryIndex, 0)})`}
                  opacity={0.15}
                />
              )}
              {selected && (
                <circle
                  className="radar-ripple"
                  cx={point.x}
                  cy={point.y}
                  r={SELECTED_RADIUS}
                  fill="none"
                  style={{ stroke: "var(--dot-glow-c)" }}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={selected ? SELECTED_RADIUS : DOT_RADIUS}
                fill={`url(#radar-dot-fill-${Math.max(categoryIndex, 0)})`}
                strokeWidth={selected ? SELECTED_STROKE_WIDTH : 0}
                className={`radar-dot-circle stroke-white stroke-opacity-75 ${
                  selected ? "stroke-foreground" : ""
                }`}
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none fill-white text-[15px] font-semibold"
              >
                {point.number}
              </text>
            </g>
          );
        })}
      </svg>

      {activePoint && activeItem && (
        <RadarTooltip
          item={activeItem}
          x={activePoint.x}
          y={activePoint.y}
        />
      )}
    </div>
  );
}
