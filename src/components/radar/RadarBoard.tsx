import RadarItemCard from "@/components/radar/RadarItemCard";
import type { RadarItem } from "@/lib/radarStore";

type RadarBoardProps = {
  items: RadarItem[];
};

const RINGS = [
  { name: "Adopt", description: "Rely on it" },
  { name: "Trial", description: "Using it on real work" },
  { name: "Assess", description: "Exploring" },
  { name: "Hold", description: "Holding off" },
] as const;

export default function RadarBoard({ items }: RadarBoardProps) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {RINGS.map((ring) => {
        const ringItems = items.filter((item) => item.ring === ring.name);

        return (
          <section key={ring.name}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">{ring.name}</h2>
              <span className="text-xs text-muted">
                {ringItems.length}{" "}
                {ringItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{ring.description}</p>

            {ringItems.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Nothing here yet</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {ringItems.map((item) => (
                  <li key={item.id}>
                    <RadarItemCard item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
