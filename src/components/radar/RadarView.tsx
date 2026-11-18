"use client";

import { useEffect, useState } from "react";
import RadarBoard from "@/components/radar/RadarBoard";
import type { RadarItem } from "@/lib/radarStore";

export default function RadarView() {
  const [items, setItems] = useState<RadarItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const response = await fetch("/api/radar");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as RadarItem[];
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load the radar.");
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-radar-item], [data-radar-info]")) {
          setSelectedId(null);
        }
      }}
    >
      {error && <p className="banner-error mt-8">{error}</p>}

      {items === null && !error && (
        <p className="mt-8 text-muted">Loading radar…</p>
      )}

      {items !== null && (
        <RadarBoard
          items={items}
          selectedId={selectedId}
          onSelect={(id) =>
            setSelectedId((previous) => (previous === id ? null : id))
          }
          hoveredId={hoveredId}
          onHover={setHoveredId}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}
    </div>
  );
}
