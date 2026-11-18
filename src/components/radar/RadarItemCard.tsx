import type { RadarItem } from "@/lib/radarStore";

type RadarItemCardProps = {
  item: RadarItem;
};

export default function RadarItemCard({ item }: RadarItemCardProps) {
  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-medium text-foreground">
          {item.name}
        </h3>
        <span className="pill shrink-0 text-xs">{item.category}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p>
    </article>
  );
}
