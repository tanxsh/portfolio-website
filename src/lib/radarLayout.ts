import type { RadarItem } from "./radarStore";

export type RadarPoint = {
  id: string;
  number: number;
  x: number;
  y: number;
};

export const VIEW_SIZE = 800;
export const CENTER = VIEW_SIZE / 2;
export const BORDER_MARGIN = 20;
export const MIN_DISTANCE = 32;

export const RING_BANDS = [
  { name: "Adopt", inner: 0, outer: 130 },
  { name: "Trial", inner: 130, outer: 225 },
  { name: "Assess", inner: 225, outer: 305 },
  { name: "Hold", inner: 305, outer: 380 },
] as const;

export type RadarQuadrant = {
  category: string;
  startAngle: number;
  endAngle: number;
};

export const RADAR_QUADRANTS: RadarQuadrant[] = [
  { category: "Languages", startAngle: Math.PI, endAngle: 1.5 * Math.PI },
  {
    category: "Frameworks & Libraries",
    startAngle: 1.5 * Math.PI,
    endAngle: 2 * Math.PI,
  },
  { category: "Platforms & Tools", startAngle: 0, endAngle: 0.5 * Math.PI },
  { category: "Techniques", startAngle: 0.5 * Math.PI, endAngle: Math.PI },
];

type CellCandidate = { x: number; y: number };

function distance(a: CellCandidate, b: CellCandidate): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function candidatesForCell(
  ringIndex: number,
  quadrant: RadarQuadrant,
): CellCandidate[] {
  const band = RING_BANDS[ringIndex];
  const candidates: CellCandidate[] = [];

  for (let row = 0; ; row++) {
    const r = band.outer - BORDER_MARGIN - row * MIN_DISTANCE;
    if (r < band.inner + BORDER_MARGIN) {
      break;
    }

    const angleMin = Math.asin(Math.min(1, BORDER_MARGIN / r));
    const angleMax = Math.PI / 2 - angleMin;
    const span = angleMax - angleMin;
    const count = Math.floor((span * r) / MIN_DISTANCE) + 1;

    for (let i = 0; i < count; i++) {
      let phi: number;
      if (count > 1) {
        const slot = span / (count - 1);
        phi = angleMin + i * slot + (row % 2 === 1 ? slot / 2 : 0);
        if (phi > angleMax) {
          continue;
        }
      } else {
        phi = (angleMin + angleMax) / 2 + (row % 2 === 1 ? span / 4 : 0);
      }

      const angle = quadrant.startAngle + phi;
      candidates.push({
        x: CENTER + r * Math.cos(angle),
        y: CENTER + r * Math.sin(angle),
      });
    }
  }

  return candidates;
}

export function layoutRadar(items: RadarItem[]): RadarPoint[] {
  const ringIndexByRing = new Map(
    RING_BANDS.map((band, index) => [band.name, index] as const),
  );
  const quadrantByCategory = new Map(
    RADAR_QUADRANTS.map((quadrant) => [quadrant.category, quadrant] as const),
  );
  const candidatesByCell = new Map<string, CellCandidate[]>();

  const placed: CellCandidate[] = [];
  const points: RadarPoint[] = [];
  let nextNumber = 1;

  for (const band of RING_BANDS) {
    for (const item of items) {
      if (item.ring !== band.name) {
        continue;
      }

      const quadrant = quadrantByCategory.get(item.category);
      if (!quadrant) {
        continue;
      }

      const cellKey = `${band.name}:${quadrant.category}`;
      let candidates = candidatesByCell.get(cellKey);
      if (!candidates) {
        const ringIndex = ringIndexByRing.get(band.name) ?? 0;
        candidates = candidatesForCell(ringIndex, quadrant);
        candidatesByCell.set(cellKey, candidates);
      }

      let chosenIndex = -1;
      for (let index = 0; index < candidates.length; index++) {
        const candidate = candidates[index];
        if (
          placed.every((spot) => distance(spot, candidate) >= MIN_DISTANCE)
        ) {
          chosenIndex = index;
          break;
        }
      }

      if (chosenIndex === -1) {
        let bestDistance = -Infinity;
        for (let index = 0; index < candidates.length; index++) {
          const candidate = candidates[index];
          const minDistance = placed.reduce(
            (min, spot) => Math.min(min, distance(spot, candidate)),
            Infinity,
          );
          if (minDistance > bestDistance) {
            bestDistance = minDistance;
            chosenIndex = index;
          }
        }
      }

      const spot = candidates[chosenIndex];
      placed.push(spot);
      points.push({
        id: item.id,
        number: nextNumber,
        x: spot.x,
        y: spot.y,
      });
      nextNumber += 1;
    }
  }

  return points;
}
