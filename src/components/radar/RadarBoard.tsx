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
    <div className="mt-4">
      <div className="flex flex-wrap justify-center gap-2">
        {FILTER_CATEGORIES.map((category) => {
          const active = category === selectedCategory;
          const style = CATEGORY_STYLES[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? style
                    ? `${style.chipActive} text-white`
                    : "border-accent bg-accent text-accent-contrast"
                  : style
                    ? `${style.chipText} border-edge`
                    : "border-edge text-muted"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div
        className="mx-auto mt-4 w-full"
        style={{
          width: "max(360px, min(100%, 760px, calc(100svh - 14.5rem)))",
        }}
      >
        <RadarChart
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          hoveredId={hoveredId}
          onHover={onHover}
          selectedCategory={selectedCategory}
        />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium">How to read</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RING_SECTIONS.map((ring) => (
            <li key={ring.name} className="card p-4">
              <p className="text-sm font-medium text-foreground">{ring.name}</p>
              <p className="mt-1 text-sm text-muted">{ring.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
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
