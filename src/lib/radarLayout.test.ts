import { describe, expect, it } from "vitest";
import type { RadarItem } from "./radarStore";
import {
  AXIS_MARGIN,
  BORDER_MARGIN,
  CENTER,
  MIN_DISTANCE,
  RING_BANDS,
  VIEW_SIZE,
  layoutRadar,
} from "./radarLayout";

let nextId = 0;

function item(name: string, category: string, ring: string): RadarItem {
  nextId += 1;
  return {
    id: `id-${nextId}`,
    name,
    category,
    ring,
    note: "",
  };
}

const fixture: RadarItem[] = [
  item("MATLAB", "Languages", "Hold"),
  item("LangGraph", "Frameworks & Libraries", "Trial"),
  item("Python", "Languages", "Adopt"),
  item("Airflow", "Platforms & Tools", "Hold"),
  item("SQL", "Languages", "Adopt"),
  item("Kubernetes", "Platforms & Tools", "Assess"),
  item("FastAPI", "Frameworks & Libraries", "Adopt"),
  item("LangChain", "Frameworks & Libraries", "Trial"),
  item("ChromaDB", "Platforms & Tools", "Adopt"),
  item("CRISP-DM", "Techniques", "Hold"),
  item("Hybrid search with reranking", "Techniques", "Adopt"),
  item("Next.js", "Frameworks & Libraries", "Trial"),
  item("R", "Languages", "Trial"),
  item("SOAP", "Techniques", "Hold"),
  item("Streamlit", "Frameworks & Libraries", "Assess"),
  item("Remix", "Frameworks & Libraries", "Trial"),
  item("TypeScript", "Languages", "Trial"),
  item("Waterfall", "Techniques", "Hold"),
  item("Docker", "Platforms & Tools", "Trial"),
  item("Manual testing", "Techniques", "Hold"),
  item("Julia", "Languages", "Assess"),
  item("Astro", "Frameworks & Libraries", "Trial"),
  item("LLM-as-a-judge", "Techniques", "Trial"),
  item("Monolith-first", "Techniques", "Hold"),
  item("dbt", "Platforms & Tools", "Assess"),
  item("Angular", "Frameworks & Libraries", "Hold"),
  item("Feature store", "Techniques", "Assess"),
];

const expectedNumbering = [
  "Python",
  "SQL",
  "FastAPI",
  "ChromaDB",
  "Hybrid search with reranking",
  "LangGraph",
  "LangChain",
  "Next.js",
  "R",
  "Remix",
  "TypeScript",
  "Docker",
  "Astro",
  "LLM-as-a-judge",
  "Kubernetes",
  "Streamlit",
  "Julia",
  "dbt",
  "Feature store",
  "MATLAB",
  "Airflow",
  "CRISP-DM",
  "SOAP",
  "Waterfall",
  "Manual testing",
  "Monolith-first",
  "Angular",
];

const itemByName = new Map(fixture.map((entry) => [entry.name, entry]));
const pointByItemId = new Map(
  layoutRadar(fixture).map((point) => [point.id, point] as const),
);

function distanceBetween(nameA: string, nameB: string): number {
  const a = pointByItemId.get(itemByName.get(nameA)!.id);
  const b = pointByItemId.get(itemByName.get(nameB)!.id);
  if (!a || !b) {
    throw new Error(`Missing layout point for ${nameA} or ${nameB}.`);
  }
  return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("layoutRadar", () => {
  it("returns one numbered entry per item", () => {
    const points = layoutRadar(fixture);

    expect(points).toHaveLength(fixture.length);
    expect(new Set(points.map((point) => point.id))).toEqual(
      new Set(fixture.map((item) => item.id)),
    );
    expect(points.map((point) => point.number)).toEqual(
      fixture.map((_, index) => index + 1),
    );
  });

  it("numbers items in ring order (Adopt, Trial, Assess, Hold), then input order", () => {
    const points = layoutRadar(fixture);
    const nameById = new Map(fixture.map((item) => [item.id, item.name]));

    const orderedNames = points
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((point) => nameById.get(point.id));

    expect(orderedNames).toEqual(expectedNumbering);
  });

  it("places every dot in its correct quadrant", () => {
    const points = layoutRadar(fixture);
    const itemById = new Map(fixture.map((item) => [item.id, item]));

    for (const point of points) {
      const item = itemById.get(point.id);
      expect(item).toBeDefined();

      switch (item?.category) {
        case "Languages":
          expect(point.x).toBeLessThan(CENTER);
          expect(point.y).toBeLessThan(CENTER);
          break;
        case "Frameworks & Libraries":
          expect(point.x).toBeGreaterThan(CENTER);
          expect(point.y).toBeLessThan(CENTER);
          break;
        case "Platforms & Tools":
          expect(point.x).toBeGreaterThan(CENTER);
          expect(point.y).toBeGreaterThan(CENTER);
          break;
        case "Techniques":
          expect(point.x).toBeLessThan(CENTER);
          expect(point.y).toBeGreaterThan(CENTER);
          break;
      }
    }
  });

  it("keeps every dot at least 28px from both axis lines", () => {
    const points = layoutRadar(fixture);

    for (const point of points) {
      expect(Math.abs(point.x - CENTER)).toBeGreaterThanOrEqual(
        AXIS_MARGIN - 1e-6,
      );
      expect(Math.abs(point.y - CENTER)).toBeGreaterThanOrEqual(
        AXIS_MARGIN - 1e-6,
      );
    }
  });

  it("places every dot inside its ring band, at least 18px from the band borders", () => {
    const points = layoutRadar(fixture);
    const itemById = new Map(fixture.map((item) => [item.id, item]));

    for (const point of points) {
      const item = itemById.get(point.id);
      const band = RING_BANDS.find((entry) => entry.name === item?.ring);
      if (!band) {
        throw new Error(`No ring band matched ring "${item?.ring}".`);
      }

      const radius = Math.hypot(point.x - CENTER, point.y - CENTER);
      expect(radius).toBeGreaterThanOrEqual(band.inner + BORDER_MARGIN - 1e-6);
      expect(radius).toBeLessThanOrEqual(band.outer - BORDER_MARGIN + 1e-6);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(VIEW_SIZE);
      expect(point.y).toBeLessThanOrEqual(VIEW_SIZE);
    }
  });

  it("keeps every pair of dot centers at least 40px apart", () => {
    const points = layoutRadar(fixture);

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.hypot(
          points[i].x - points[j].x,
          points[i].y - points[j].y,
        );
        expect(distance).toBeGreaterThanOrEqual(MIN_DISTANCE - 1e-6);
      }
    }
  });

  it("spreads a cell with 2 items wider than a cell with 5 items", () => {
    const twoItemGap = distanceBetween("R", "TypeScript");
    const fiveItemGap = distanceBetween("LangGraph", "LangChain");

    expect(twoItemGap).toBeGreaterThan(fiveItemGap);
  });

  it("is deterministic for the same input", () => {
    expect(layoutRadar(fixture)).toEqual(layoutRadar(fixture));
  });
});
