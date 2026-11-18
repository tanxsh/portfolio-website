"use client";

import RadarChart from "@/components/radar/RadarChart";
import RadarLegend, {
  RING_SECTIONS,
} from "@/components/radar/RadarLegend";
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

const CATEGORY_CHIP_STYLES: Record<string, { text: string; active: string }> = {
  Languages: {
    text: "text-sky-600 dark:text-sky-400",
    active: "bg-sky-500 border-sky-500",
  },
  "Frameworks & Libraries": {
    text: "text-violet-600 dark:text-violet-400",
    active: "bg-violet-500 border-violet-500",
  },
  "Platforms & Tools": {
    text: "text-emerald-600 dark:text-emerald-400",
    active: "bg-emerald-500 border-emerald-500",
  },
  Techniques: {
    text: "text-amber-600 dark:text-amber-400",
    active: "bg-amber-500 border-amber-500",
  },
};

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
          const colors = CATEGORY_CHIP_STYLES[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? colors
                    ? `${colors.active} text-white`
                    : "border-accent bg-accent text-accent-contrast"
                  : colors
                    ? `${colors.text} border-edge`
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
