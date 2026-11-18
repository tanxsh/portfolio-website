import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createRadarItem,
  deleteRadarItem,
  getRadarItemById,
  listRadarItems,
  updateRadarItem,
} from "./radarStore";
import type { RadarFields } from "./validateRadarItem";

const validItem: RadarFields = {
  name: "Python",
  category: "Languages",
  ring: "Adopt",
  note: "My main language for ML, data pipelines and APIs",
};

describe("radarStore", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "radar-store-"));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("creates radar.json when the file is missing", async () => {
    const stored = await createRadarItem(validItem, dataDir);
    const parsed = JSON.parse(
      await readFile(path.join(dataDir, "radar.json"), "utf8"),
    );

    expect(existsSync(path.join(dataDir, "radar.json"))).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(stored);
    expect(stored.id).toBeTruthy();
  });

  it("lists items and finds one by id", async () => {
    const stored = await createRadarItem(validItem, dataDir);

    expect(await listRadarItems(dataDir)).toEqual([stored]);
    expect((await getRadarItemById(stored.id, dataDir))?.name).toBe("Python");
    expect(await getRadarItemById("missing", dataDir)).toBeUndefined();
  });

  it("updates an item but keeps its id", async () => {
    const stored = await createRadarItem(validItem, dataDir);

    const updated = await updateRadarItem(
      stored.id,
      {
        name: "Python",
        category: "Languages",
        ring: "Trial",
        note: "Re-evaluating",
      },
      dataDir,
    );

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(stored.id);
    expect(updated?.ring).toBe("Trial");
    expect(updated?.note).toBe("Re-evaluating");
    expect((await listRadarItems(dataDir))[0].ring).toBe("Trial");
  });

  it("returns undefined when updating a missing id", async () => {
    expect(await updateRadarItem("missing", validItem, dataDir)).toBeUndefined();
  });

  it("deletes an item and reports whether it existed", async () => {
    const stored = await createRadarItem(validItem, dataDir);

    expect(await deleteRadarItem(stored.id, dataDir)).toBe(true);
    expect(await listRadarItems(dataDir)).toEqual([]);
    expect(await deleteRadarItem(stored.id, dataDir)).toBe(false);
  });

  it("treats an empty file as an empty list", async () => {
    await writeFile(path.join(dataDir, "radar.json"), "", "utf8");

    expect(await listRadarItems(dataDir)).toEqual([]);

    const stored = await createRadarItem(validItem, dataDir);
    expect(await listRadarItems(dataDir)).toEqual([stored]);
  });
});
