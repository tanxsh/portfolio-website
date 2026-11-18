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

            <ul className="mt-2 flex flex-col gap-1.5">
              {ringItems.map((item) => {
                const number = numberById.get(item.id);
                const style = CATEGORY_STYLES[item.category];
                const activeId = hoveredId ?? selectedId;
                const dimmedByActivity =
                  activeId !== null && item.id !== activeId;
                const dimmedByCategory =
                  selectedCategory !== "All" &&
                  item.category !== selectedCategory;
                const selected = selectedId === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-radar-item=""
                      onClick={() => onSelect(item.id)}
                      onMouseEnter={() => onHover(item.id)}
                      onMouseLeave={() => onHover(null)}
                      onFocus={() => onHover(item.id)}
                      onBlur={() => onHover(null)}
                      aria-pressed={selected}
                      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition duration-200 ${
                        selected
                          ? `border-2 ${style?.tintActive ?? "bg-zinc-500/28"} ${
                              style?.borderStrong ?? "border-zinc-500"
                            }`
                          : hoveredId === item.id
                            ? `${style?.tintHovered ?? "bg-zinc-500/18"} ${
                                style?.borderSoft ?? "border-zinc-500/40"
                              }`
                            : `${style?.tint ?? "bg-zinc-500/12"} ${
                                style?.borderSoft ?? "border-zinc-500/40"
                              } ${style?.tintHover ?? "hover:bg-zinc-500/18"}`
                      } ${
                        dimmedByActivity
                          ? "opacity-35"
                          : dimmedByCategory
                            ? "opacity-40"
                            : ""
                      }`}
                    >
                      <span className="w-5 shrink-0 text-right text-xs font-semibold leading-5 text-muted">
                        {number ?? ""}
                      </span>
                      <span className="min-w-0 whitespace-normal text-sm leading-5 text-foreground">
                        {item.name}
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
