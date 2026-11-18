export const RADAR_CATEGORIES = [
  "Languages",
  "Frameworks",
  "Tools",
  "Practices",
] as const;

export const RADAR_RINGS = ["Adopt", "Trial", "Assess", "Hold"] as const;

export type RadarCategory = (typeof RADAR_CATEGORIES)[number];
export type RadarRing = (typeof RADAR_RINGS)[number];

export type RadarFields = {
  name: string;
  category: RadarCategory;
  ring: RadarRing;
  note: string;
};

export type RadarErrors = {
  name?: string;
  category?: string;
  ring?: string;
  note?: string;
};

export type RadarValidation = {
  valid: boolean;
  errors: RadarErrors;
  data: RadarFields;
};

const NOTE_MAX_LENGTH = 200;

export function validateRadarItem(input: RadarFields): RadarValidation {
  const data: RadarFields = {
    name: input.name.trim(),
    category: input.category,
    ring: input.ring,
    note: input.note.trim(),
  };

  const errors: RadarErrors = {};

  if (data.name.length === 0) {
    errors.name = "Name is required.";
  }

  if (!RADAR_CATEGORIES.includes(data.category)) {
    errors.category = `Category must be one of: ${RADAR_CATEGORIES.join(", ")}.`;
  }

  if (!RADAR_RINGS.includes(data.ring)) {
    errors.ring = `Ring must be one of: ${RADAR_RINGS.join(", ")}.`;
  }

  if (data.note.length === 0) {
    errors.note = "Note is required.";
  } else if (data.note.length > NOTE_MAX_LENGTH) {
    errors.note = `Note must be at most ${NOTE_MAX_LENGTH} characters.`;
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}
