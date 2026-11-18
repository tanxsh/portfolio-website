"use client";

import { useEffect, useState } from "react";
import RadarBoard from "@/components/radar/RadarBoard";
import type { RadarItem } from "@/lib/radarStore";

export default function RadarView() {
  const [items, setItems] = useState<RadarItem[] | null>(null);
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

  return (
    <div>
      {error && <p className="banner-error mt-8">{error}</p>}

      {items === null && !error && (
        <p className="mt-8 text-muted">Loading radar…</p>
      )}

      {items !== null && <RadarBoard items={items} />}
    </div>
  );
}
