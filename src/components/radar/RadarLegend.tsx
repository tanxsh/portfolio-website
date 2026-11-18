"use client";

import { layoutRadar } from "@/lib/radarLayout";
import type { RadarItem } from "@/lib/radarStore";

type RadarLegendProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const RING_SECTIONS = [
  { name: "Adopt", description: "Part of my everyday toolkit" },
  { name: "Trial", description: "What I'm exploring" },
  { name: "Assess", description: "What I'm curious about and looking into" },
  { name: "Hold", description: "Not part of my everyday toolkit anymore" },
] as const;

export default function RadarLegend({
  items,
  selectedId,
  onSelect,
}: RadarLegendProps) {
  const numberById = new Map(
    layoutRadar(items).map((point) => [point.id, point.number] as const),
  );

  return (
    <div className="flex flex-col gap-6">
      {RING_SECTIONS.map((ring) => {
        const ringItems = items.filter((item) => item.ring === ring.name);

        return (
          <section key={ring.name}>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-medium">{ring.name}</h3>
              <span className="text-xs text-muted">
                {ringItems.length} {ringItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{ring.description}</p>

            <ul className="mt-2 flex flex-col">
              {ringItems.map((item) => {
                const number = numberById.get(item.id);

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-colors ${
                        selectedId === item.id
                          ? "bg-accent-soft"
                          : "hover:bg-accent-soft/50"
                      }`}
                    >
                      <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted">
                        {number ?? ""}
                      </span>
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {item.name}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-muted">
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
