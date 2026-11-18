"use client";

import { layoutRadar } from "@/lib/radarLayout";
import { CATEGORY_STYLES } from "@/components/radar/categoryStyles";
import type { RadarItem } from "@/lib/radarStore";

type RadarLegendProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  selectedCategory: string;
};

export const RING_SECTIONS = [
  { name: "Adopt", description: "Part of my everyday toolkit" },
  { name: "Trial", description: "What I'm exploring" },
  { name: "Assess", description: "What I'm curious about and looking into" },
  { name: "Hold", description: "Not part of my everyday toolkit anymore" },
] as const;

export default function RadarLegend({
  items,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  selectedCategory,
}: RadarLegendProps) {
  const numberById = new Map(
    layoutRadar(items).map((point) => [point.id, point.number] as const),
  );

  return (
    <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {RING_SECTIONS.map((ring) => {
        const ringItems = items.filter((item) => item.ring === ring.name);

        return (
          <section key={ring.name}>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-medium">{ring.name}</h3>
              <span className="text-xs text-muted">
                {ringItems.length} {ringItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{ring.description}</p>

            <ul className="mt-2 flex flex-col">
              {ringItems.map((item) => {
                const number = numberById.get(item.id);
                const style = CATEGORY_STYLES[item.category];
                const dimmed =
                  selectedCategory !== "All" &&
                  item.category !== selectedCategory;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      onMouseEnter={() => onHover(item.id)}
                      onMouseLeave={() => onHover(null)}
                      onFocus={() => onHover(item.id)}
                      onBlur={() => onHover(null)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border-l-2 px-3 py-1.5 text-left transition-colors ${
                        style?.border ?? "border-edge"
                      } ${
                        selectedId === item.id || hoveredId === item.id
                          ? "bg-accent-soft"
                          : "hover:bg-accent-soft/50"
                      } ${dimmed ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          style?.bar ?? "bg-zinc-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted">
                        {number ?? ""}
                      </span>
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {item.name}
                      </span>
                      <span
                        className={`ml-auto shrink-0 text-xs ${
                          style?.chipText ?? "text-muted"
                        }`}
                      >
                        {item.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
