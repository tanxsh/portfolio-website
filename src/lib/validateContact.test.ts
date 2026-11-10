import { describe, expect, it } from "vitest";
import { validateContact } from "./validateContact";

describe("validateContact", () => {
  it("accepts valid input and trims all values", () => {
    const result = validateContact({
      name: "  Tanish  ",
      email: " tanish@example.com ",
      message: "  hello there  ",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual({
      name: "Tanish",
      email: "tanish@example.com",
      message: "hello there",
    });
  });

  it("rejects a blank name", () => {
    const result = validateContact({
      name: "   ",
      email: "a@b.com",
      message: "hi",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeUndefined();
    expect(result.errors.message).toBeUndefined();
  });

  it("rejects a blank message", () => {
    const result = validateContact({
      name: "Tanish",
      email: "a@b.com",
      message: "   ",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
    expect(result.errors.name).toBeUndefined();
    expect(result.errors.email).toBeUndefined();
  });

  it.each([
    ["a@@b.com", "exactly one @"],
    ["a@b", "contain a dot"],
    ["a@.com", "empty labels"],
    ["a@b..com", "empty labels"],
    ["@b.com", "text before the @"],
    ["a b@c.com", "whitespace"],
  ])("rejects email %s", (email, expectedReason) => {
    const result = validateContact({
      name: "Tanish",
      email,
      message: "hi",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.email).toContain(expectedReason);
  });
});
