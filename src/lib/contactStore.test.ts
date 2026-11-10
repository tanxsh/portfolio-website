import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appendContact } from "./contactStore";

const validContact = {
  name: "Tanish",
  email: "tanish@example.com",
  message: "hi",
};

describe("appendContact", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "contact-store-"));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("creates contacts.json when the file is missing", async () => {
    const stored = await appendContact(validContact, dataDir);
    const parsed = JSON.parse(
      await readFile(path.join(dataDir, "contacts.json"), "utf8"),
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(stored);
    expect(stored.id).toBeTruthy();
    expect(stored.submittedAt).toBeTruthy();
  });

  it("treats an empty file as an empty list", async () => {
    await writeFile(path.join(dataDir, "contacts.json"), "", "utf8");

    const stored = await appendContact(validContact, dataDir);
    const parsed = JSON.parse(
      await readFile(path.join(dataDir, "contacts.json"), "utf8"),
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(stored);
  });

  it("appends to an existing valid array", async () => {
    const existing = [
      {
        id: "existing-id",
        name: "Earlier",
        email: "earlier@example.com",
        message: "earlier",
        submittedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    await writeFile(
      path.join(dataDir, "contacts.json"),
      JSON.stringify(existing, null, 2),
      "utf8",
    );

    await appendContact(validContact, dataDir);
    const parsed = JSON.parse(
      await readFile(path.join(dataDir, "contacts.json"), "utf8"),
    );

    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe("existing-id");
  });

  it("throws on corrupt JSON and leaves the file unchanged", async () => {
    const corrupt = "{ not valid json";
    await writeFile(path.join(dataDir, "contacts.json"), corrupt, "utf8");

    await expect(appendContact(validContact, dataDir)).rejects.toThrow();

    expect(await readFile(path.join(dataDir, "contacts.json"), "utf8")).toBe(
      corrupt,
    );
    expect(existsSync(path.join(dataDir, "contacts.json.tmp"))).toBe(false);
  });

  it("throws on valid JSON that is not an array and leaves the file unchanged", async () => {
    const notArray = JSON.stringify({ contacts: [] });
    await writeFile(path.join(dataDir, "contacts.json"), notArray, "utf8");

    await expect(appendContact(validContact, dataDir)).rejects.toThrow();

    expect(await readFile(path.join(dataDir, "contacts.json"), "utf8")).toBe(
      notArray,
    );
    expect(existsSync(path.join(dataDir, "contacts.json.tmp"))).toBe(false);
  });
});
