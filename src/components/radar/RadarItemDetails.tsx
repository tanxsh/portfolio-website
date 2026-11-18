import type { RadarItem } from "@/lib/radarStore";

type RadarItemDetailsProps = {
  item: RadarItem | null;
};

export default function RadarItemDetails({ item }: RadarItemDetailsProps) {
  if (item === null) {
    return (
      <div className="card p-6">
        <p className="text-muted">Select an item to see details</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-foreground">{item.name}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="pill text-xs">{item.category}</span>
        <span className="pill text-xs">{item.ring}</span>
      </div>
      {item.note.length > 0 && (
        <p className="mt-3 text-sm leading-6 text-muted">{item.note}</p>
      )}
    </div>
  );
}
