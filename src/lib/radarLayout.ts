import type { RadarItem } from "./radarStore";

export type RadarPoint = {
  id: string;
  number: number;
  x: number;
  y: number;
};

export const VIEW_SIZE = 800;
export const CENTER = VIEW_SIZE / 2;
export const BORDER_MARGIN = 18;
export const AXIS_MARGIN = 28;
export const MIN_DISTANCE = 40;

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

const MIN_ROW_RADIUS = 40;
const MAX_SPACING = 80;
const MAX_ROWS = 6;

function distance(a: CellCandidate, b: CellCandidate): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angularSpan(r: number): number {
  return Math.PI / 2 - 2 * Math.asin(Math.min(1, AXIS_MARGIN / r));
}

function rowCapacity(r: number): number {
  const span = angularSpan(r);
  if (span <= 0) {
    return 0;
  }
  return Math.floor((span * r) / MIN_DISTANCE) + 1;
}

function evenlySpread(lo: number, hi: number, count: number): number[] {
  if (count === 1) {
    return [(lo + hi) / 2];
  }
  return Array.from(
    { length: count },
    (_, index) => lo + (index * (hi - lo)) / (count - 1),
  );
}

function candidatesForCell(
  itemCount: number,
  ringIndex: number,
  quadrant: RadarQuadrant,
): CellCandidate[] {
  const band = RING_BANDS[ringIndex];
  if (itemCount <= 0) {
    return [];
  }

  const radiusLow = Math.max(
    band.inner + BORDER_MARGIN,
    MIN_ROW_RADIUS,
  );
  const radiusHigh = band.outer - BORDER_MARGIN;
  if (radiusHigh < radiusLow) {
    return [];
  }

  let radii: number[] = [];
  let capacities: number[] = [];
  let rows = 1;

  for (; rows <= MAX_ROWS; rows++) {
    radii = evenlySpread(radiusLow, radiusHigh, rows);
    capacities = radii.map(rowCapacity);
    const total = capacities.reduce((sum, capacity) => sum + capacity, 0);
    if (total >= itemCount) {
      break;
    }
  }

  const targetPerRow = Math.ceil(itemCount / rows);
  const rowOrder = radii
    .map((_, index) => index)
    .sort((a, b) => radii[b] - radii[a]);

  const candidates: CellCandidate[] = [];
  let remaining = itemCount;

  for (const rowIndex of rowOrder) {
    if (remaining <= 0) {
      break;
    }

    const r = radii[rowIndex];
    const capacity = capacities[rowIndex];
    const count = Math.min(capacity, remaining, targetPerRow);
    if (count <= 0) {
      continue;
    }

    const span = angularSpan(r);
    const arc = span * r;
    const slot = count > 1 ? Math.min(MAX_SPACING, arc / (count - 1)) / r : 0;

    for (let i = 0; i < count; i++) {
      const phi = Math.PI / 4 + (i - (count - 1) / 2) * slot;
      const angle = quadrant.startAngle + phi;
      candidates.push({
        x: CENTER + r * Math.cos(angle),
        y: CENTER + r * Math.sin(angle),
      });
    }

    remaining -= count;
  }

  return candidates;
}

export function layoutRadar(items: RadarItem[]): RadarPoint[] {
  const ringIndexByRing = new Map<string, number>(
    RING_BANDS.map((band, index) => [band.name, index] as const),
  );
  const quadrantByCategory = new Map(
    RADAR_QUADRANTS.map((quadrant) => [quadrant.category, quadrant] as const),
  );

  const cellCounts = new Map<string, number>();
  for (const item of items) {
    if (!ringIndexByRing.has(item.ring) || !quadrantByCategory.has(item.category)) {
      continue;
    }
    const key = `${item.ring}:${item.category}`;
    cellCounts.set(key, (cellCounts.get(key) ?? 0) + 1);
  }

  const candidatesByCell = new Map<string, CellCandidate[]>();
  for (const [key, count] of cellCounts) {
    const [ringName, categoryName] = key.split(":");
    const ringIndex = ringIndexByRing.get(ringName) ?? 0;
    const quadrant = quadrantByCategory.get(categoryName);
    if (!quadrant) {
      continue;
    }
    candidatesByCell.set(
      key,
      candidatesForCell(count, ringIndex, quadrant),
    );
  }

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
      const candidates = candidatesByCell.get(cellKey) ?? [];

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
      if (!spot) {
        continue;
      }

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
