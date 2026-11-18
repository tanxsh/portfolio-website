import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";
import type { RadarFields } from "./validateRadarItem";

export type RadarItem = {
  id: string;
  name: string;
  category: string;
  ring: string;
  note: string;
};

const defaultDataDir = path.join(process.cwd(), "data");

export async function listRadarItems(
  dataDir: string = defaultDataDir,
): Promise<RadarItem[]> {
  return readJsonArrayFile<RadarItem>(path.join(dataDir, "radar.json"));
}

export async function getRadarItemById(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<RadarItem | undefined> {
  const items = await listRadarItems(dataDir);
  return items.find((item) => item.id === id);
}

export async function createRadarItem(
  fields: RadarFields,
  dataDir: string = defaultDataDir,
): Promise<RadarItem> {
  const radarFile = path.join(dataDir, "radar.json");
  const items = await readJsonArrayFile<RadarItem>(radarFile);

  const stored: RadarItem = {
    id: crypto.randomUUID(),
    name: fields.name,
    category: fields.category,
    ring: fields.ring,
    note: fields.note,
  };

  items.push(stored);
  await writeJsonArrayFile(radarFile, items);

  return stored;
}

export async function updateRadarItem(
  id: string,
  fields: RadarFields,
  dataDir: string = defaultDataDir,
): Promise<RadarItem | undefined> {
  const radarFile = path.join(dataDir, "radar.json");
  const items = await readJsonArrayFile<RadarItem>(radarFile);

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: RadarItem = {
    ...items[index],
    name: fields.name,
    category: fields.category,
    ring: fields.ring,
    note: fields.note,
  };

  items[index] = updated;
  await writeJsonArrayFile(radarFile, items);

  return updated;
}

export async function deleteRadarItem(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<boolean> {
  const radarFile = path.join(dataDir, "radar.json");
  const items = await readJsonArrayFile<RadarItem>(radarFile);

  const remaining = items.filter((item) => item.id !== id);
  if (remaining.length === items.length) {
    return false;
  }

  await writeJsonArrayFile(radarFile, remaining);
  return true;
}
