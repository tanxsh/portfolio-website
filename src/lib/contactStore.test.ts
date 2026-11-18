import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appendContact, deleteContact, getContactById, listContacts, updateContact } from "./contactStore";

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

describe("contact CRUD", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "contact-store-"));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("lists contacts", async () => {
    const stored = await appendContact(validContact, dataDir);

    expect(await listContacts(dataDir)).toEqual([stored]);
  });

  it("finds a contact by id", async () => {
    const stored = await appendContact(validContact, dataDir);

    expect((await getContactById(stored.id, dataDir))?.name).toBe("Tanish");
    expect(await getContactById("missing", dataDir)).toBeUndefined();
  });

  it("updates name, email and message but keeps id and submittedAt", async () => {
    const stored = await appendContact(validContact, dataDir);

    const updated = await updateContact(
      stored.id,
      {
        name: "Updated Name",
        email: "updated@example.com",
        message: "Updated message",
      },
      dataDir,
    );

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(stored.id);
    expect(updated?.submittedAt).toBe(stored.submittedAt);
    expect(updated?.name).toBe("Updated Name");
    expect(updated?.email).toBe("updated@example.com");
    expect(updated?.message).toBe("Updated message");
    expect((await listContacts(dataDir))[0].name).toBe("Updated Name");
  });

  it("returns undefined when updating a missing id", async () => {
    expect(
      await updateContact(
        "missing",
        { name: "N", email: "n@example.com", message: "M" },
        dataDir,
      ),
    ).toBeUndefined();
  });

  it("deletes a contact and reports whether it existed", async () => {
    const stored = await appendContact(validContact, dataDir);

    expect(await deleteContact(stored.id, dataDir)).toBe(true);
    expect(await listContacts(dataDir)).toEqual([]);
    expect(await deleteContact(stored.id, dataDir)).toBe(false);
  });
});
