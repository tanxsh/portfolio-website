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
      <div className="xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-8">
        <div aria-hidden="true" />

        <div
          className="mx-auto w-full"
          style={{
            width: "max(360px, min(100%, 880px, calc(100svh - 11rem)))",
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

        <aside className="mt-6 flex flex-wrap gap-1.5 xl:mt-0 xl:w-56 xl:flex-col xl:items-start xl:self-start">
          {FILTER_CATEGORIES.map((category) => {
            const active = category === selectedCategory;
            const style = CATEGORY_STYLES[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
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
        </aside>
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
