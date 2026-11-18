import { describe, expect, it } from "vitest";
import { validateProject } from "./validateProject";

const validInput = {
  title: "  Sample Project  ",
  summary: " A summary ",
  description: " A description ",
  tech: [" Python ", "CLI"],
  link: " https://github.com/tanxsh/sample ",
};

describe("validateProject", () => {
  it("accepts valid input and trims all values", () => {
    const result = validateProject(validInput);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.data).toEqual({
      title: "Sample Project",
      summary: "A summary",
      description: "A description",
      tech: ["Python", "CLI"],
      link: "https://github.com/tanxsh/sample",
    });
  });

  it("rejects a blank title", () => {
    const result = validateProject({ ...validInput, title: "   " });

    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it("rejects a blank summary", () => {
    const result = validateProject({ ...validInput, summary: "   " });

    expect(result.valid).toBe(false);
    expect(result.errors.summary).toBeDefined();
  });

  it("rejects a blank description", () => {
    const result = validateProject({ ...validInput, description: "" });

    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it("rejects a missing or non-array tech field", () => {
    const result = validateProject({ ...validInput, tech: "Python" });

    expect(result.valid).toBe(false);
    expect(result.errors.tech).toBeDefined();
  });

  it("rejects an empty tech array", () => {
    const result = validateProject({ ...validInput, tech: [] });

    expect(result.valid).toBe(false);
    expect(result.errors.tech).toBeDefined();
  });

  it("rejects a tech array containing blank or non-string entries", () => {
    const blank = validateProject({ ...validInput, tech: ["Python", "  "] });
    const nonString = validateProject({
      ...validInput,
      tech: ["Python", 42 as unknown as string],
    });

    expect(blank.valid).toBe(false);
    expect(blank.errors.tech).toBeDefined();
    expect(nonString.valid).toBe(false);
    expect(nonString.errors.tech).toBeDefined();
  });

  it("rejects a blank link", () => {
    const result = validateProject({ ...validInput, link: "" });

    expect(result.valid).toBe(false);
    expect(result.errors.link).toBeDefined();
  });

  it("rejects a link that is not a valid URL", () => {
    const result = validateProject({ ...validInput, link: "not-a-url" });

    expect(result.valid).toBe(false);
    expect(result.errors.link).toBeDefined();
  });

  it("rejects a link that does not use http or https", () => {
    const ftp = validateProject({ ...validInput, link: "ftp://files.example.com" });
    const javascript = validateProject({
      ...validInput,
      link: "javascript:alert(1)",
    });

    expect(ftp.valid).toBe(false);
    expect(ftp.errors.link).toBeDefined();
    expect(javascript.valid).toBe(false);
    expect(javascript.errors.link).toBeDefined();
  });

  it("accepts both http and https links", () => {
    const http = validateProject({ ...validInput, link: "http://example.com" });
    const https = validateProject({
      ...validInput,
      link: "https://example.com/repo",
    });

    expect(http.valid).toBe(true);
    expect(https.valid).toBe(true);
  });
});
