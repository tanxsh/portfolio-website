import { describe, expect, it } from "vitest";
import type { RadarItem } from "./radarStore";
import {
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
  item("Python", "Languages", "Adopt"),
  item("SQL", "Languages", "Adopt"),
  item("FastAPI", "Frameworks & Libraries", "Adopt"),
  item("Next.js", "Frameworks & Libraries", "Adopt"),
  item("ChromaDB", "Platforms & Tools", "Adopt"),
  item("Hybrid search with reranking", "Techniques", "Adopt"),
  item("R", "Languages", "Trial"),
  item("TypeScript", "Languages", "Trial"),
  item("LangGraph", "Frameworks & Libraries", "Trial"),
  item("LangChain", "Frameworks & Libraries", "Trial"),
  item("Docker", "Platforms & Tools", "Trial"),
  item("LLM-as-a-judge", "Techniques", "Trial"),
  item("Julia", "Languages", "Assess"),
  item("Streamlit", "Frameworks & Libraries", "Assess"),
  item("Kubernetes", "Platforms & Tools", "Assess"),
  item("LLM-as-a-judge v2", "Techniques", "Assess"),
  item("MATLAB", "Languages", "Hold"),
  item("Angular", "Frameworks & Libraries", "Hold"),
  item("Airflow", "Platforms & Tools", "Hold"),
  item("CRISP-DM", "Techniques", "Hold"),
];

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
    const expectedOrder = [
      "Python",
      "SQL",
      "FastAPI",
      "Next.js",
      "ChromaDB",
      "Hybrid search with reranking",
      "R",
      "TypeScript",
      "LangGraph",
      "LangChain",
      "Docker",
      "LLM-as-a-judge",
      "Julia",
      "Streamlit",
      "Kubernetes",
      "LLM-as-a-judge v2",
      "MATLAB",
      "Angular",
      "Airflow",
      "CRISP-DM",
    ];
    const nameById = new Map(fixture.map((item) => [item.id, item.name]));

    const orderedNames = points
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((point) => nameById.get(point.id));

    expect(orderedNames).toEqual(expectedOrder);
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

  it("places every dot inside its ring band, at least 20px from the band borders", () => {
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

  it("keeps every pair of dot centers at least 32px apart", () => {
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

  it("is deterministic for the same input", () => {
    expect(layoutRadar(fixture)).toEqual(layoutRadar(fixture));
  });
});
