import { describe, expect, it } from "vitest";
import { validateBlog } from "./validateBlog";

describe("validateBlog", () => {
  it("accepts valid input and trims all values", () => {
    const result = validateBlog({ title: "  Hello  ", content: " world " });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual({ title: "Hello", content: "world" });
  });

  it("rejects a blank title", () => {
    const result = validateBlog({ title: "   ", content: "body" });

    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.content).toBeUndefined();
  });

  it("rejects a blank content", () => {
    const result = validateBlog({ title: "Hello", content: "   " });

    expect(result.valid).toBe(false);
    expect(result.errors.content).toBeDefined();
    expect(result.errors.title).toBeUndefined();
  });
});
