"use client";

import RadarChart from "@/components/radar/RadarChart";
import RadarItemDetails from "@/components/radar/RadarItemDetails";
import RadarLegend from "@/components/radar/RadarLegend";
import type { RadarItem } from "@/lib/radarStore";

type RadarBoardProps = {
  items: RadarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function RadarBoard({
  items,
  selectedId,
  onSelect,
}: RadarBoardProps) {
  const selectedItem =
    items.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <RadarChart items={items} selectedId={selectedId} onSelect={onSelect} />

      <div className="flex flex-col gap-8">
        <RadarLegend items={items} selectedId={selectedId} onSelect={onSelect} />
        <RadarItemDetails item={selectedItem} />
      </div>
    </div>
  );
}
