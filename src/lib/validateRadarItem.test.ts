import { describe, expect, it } from "vitest";
import {
  RADAR_CATEGORIES,
  RADAR_RINGS,
  validateRadarItem,
  type RadarCategory,
  type RadarFields,
  type RadarRing,
} from "./validateRadarItem";

const validItem: RadarFields = {
  name: "Python",
  category: "Languages",
  ring: "Adopt",
  note: "My main language for ML, data pipelines and APIs",
};

describe("validateRadarItem", () => {
  it("accepts a valid item", () => {
    const result = validateRadarItem(validItem);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual(validItem);
  });

  it("trims values", () => {
    const result = validateRadarItem({
      name: "  Python  ",
      category: "Languages",
      ring: "Adopt",
      note: "  Trimmed note  ",
    });

    expect(result.valid).toBe(true);
    expect(result.data.name).toBe("Python");
    expect(result.data.note).toBe("Trimmed note");
  });

  it("requires a non-blank name", () => {
    const result = validateRadarItem({ ...validItem, name: "   " });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe("Name is required.");
  });

  it("rejects a category outside the allowed list", () => {
    const result = validateRadarItem({
      ...validItem,
      category: "Databases" as RadarCategory,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.category).toBe(
      "Category must be one of: Languages, Frameworks & Libraries, Platforms & Tools, Techniques.",
    );
  });

  it("accepts every allowed category", () => {
    for (const category of RADAR_CATEGORIES) {
      const result = validateRadarItem({ ...validItem, category });
      expect(result.valid).toBe(true);
    }
  });

  it("rejects a ring outside the allowed list", () => {
    const result = validateRadarItem({
      ...validItem,
      ring: "Maybe" as RadarRing,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.ring).toBe(
      "Ring must be one of: Adopt, Trial, Assess, Hold.",
    );
  });

  it("accepts every allowed ring", () => {
    for (const ring of RADAR_RINGS) {
      const result = validateRadarItem({ ...validItem, ring });
      expect(result.valid).toBe(true);
    }
  });

  it("allows a blank note", () => {
    for (const note of ["", "   "]) {
      const result = validateRadarItem({ ...validItem, note });

      expect(result.valid).toBe(true);
      expect(result.errors.note).toBeUndefined();
      expect(result.data.note).toBe("");
    }
  });

  it("rejects a note longer than 200 characters", () => {
    const result = validateRadarItem({ ...validItem, note: "x".repeat(201) });

    expect(result.valid).toBe(false);
    expect(result.errors.note).toBe("Note must be at most 200 characters.");
  });

  it("accepts a note of exactly 200 characters", () => {
    const result = validateRadarItem({ ...validItem, note: "x".repeat(200) });

    expect(result.valid).toBe(true);
  });
});
