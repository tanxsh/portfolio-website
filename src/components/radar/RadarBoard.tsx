"use client";

import RadarChart from "@/components/radar/RadarChart";
import RadarLegend, {
  RING_SECTIONS,
} from "@/components/radar/RadarLegend";
import { CATEGORY_STYLES } from "@/components/radar/categoryStyles";
import type { RadarItem } from "@/lib/radarStore";

type RadarBoardProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

const FILTER_CATEGORIES = [
  "All",
  "Languages",
  "Frameworks & Libraries",
  "Platforms & Tools",
  "Techniques",
];

export default function RadarBoard({
  items,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  selectedCategory,
  onSelectCategory,
}: RadarBoardProps) {
  return (
    <div
      className="mt-4 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_var(--radar-size)_minmax(0,1fr)] lg:gap-6"
      style={
        {
          "--radar-size": "clamp(340px, calc(100svh - 11rem), 880px)",
        } as React.CSSProperties
      }
    >
      <div className="order-2 mt-8 flex flex-row flex-wrap justify-center gap-3 lg:order-none lg:mt-0 lg:flex-col lg:items-center lg:justify-center lg:gap-3">
        {RING_SECTIONS.map((ring) => {
          const descId = `radar-ring-desc-${ring.name.toLowerCase()}`;

          return (
            <div key={ring.name} className="group relative">
              <button
                type="button"
                tabIndex={0}
                aria-describedby={descId}
                className="w-28 rounded-xl border border-accent/30 bg-accent-soft px-4 py-2 text-center text-sm font-medium text-accent"
              >
                {ring.name}
              </button>
              <span
                id={descId}
                role="tooltip"
                className="pointer-events-none invisible absolute left-full top-1/2 z-50 ml-3 w-56 -translate-y-1/2 scale-95 rounded-lg border border-edge bg-surface px-3 py-2 text-xs opacity-0 shadow-lg transition-all duration-150 group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100"
              >
                <span className="block font-semibold text-foreground">
                  {ring.name}
                </span>
                <span className="mt-0.5 block text-muted">
                  {ring.description}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="order-1 mx-auto w-[min(100%,var(--radar-size))] px-4 lg:order-none lg:w-full lg:px-0">
        <RadarChart
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          hoveredId={hoveredId}
          onHover={onHover}
          selectedCategory={selectedCategory}
        />
      </div>

      <aside className="order-3 mt-6 lg:order-none lg:mt-0 lg:flex lg:flex-col lg:justify-center">
        <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-center">
          {FILTER_CATEGORIES.map((category) => {
            const active = category === selectedCategory;
            const style = CATEGORY_STYLES[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`w-52 rounded-xl border px-4 py-2 text-center text-sm font-medium transition-colors ${
                  active
                    ? style
                      ? `${style.chipActive} text-white`
                      : "border-accent bg-accent text-accent-contrast"
                    : style
                      ? `${style.chipText} ${style.tint} ${style.borderSoft} ${style.tintHover}`
                      : "border-edge text-muted hover:bg-accent-soft"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="order-4 mt-12 lg:order-none lg:col-span-3">
        <h2 className="text-lg font-medium">All items</h2>
        <RadarLegend
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          hoveredId={hoveredId}
          onHover={onHover}
          selectedCategory={selectedCategory}
        />
      </section>
    </div>
  );
}
