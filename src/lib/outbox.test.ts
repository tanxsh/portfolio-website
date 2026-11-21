import { describe, expect, it } from "vitest";
import {
  OUTBOX_KEY,
  addToOutbox,
  loadOutbox,
  markAttempt,
  removeFromOutbox,
  saveOutbox,
  type OutboxItem,
  type OutboxStorage,
} from "./outbox";

type FakeStorage = OutboxStorage & { map: Map<string, string> };

function createFakeStorage(initial: Record<string, string> = {}): FakeStorage {
  const map = new Map<string, string>(Object.entries(initial));

  return {
    map,
    getItem(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

function makeItem(overrides: Partial<OutboxItem> = {}): OutboxItem {
  return {
    id: "id-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    queuedAt: "2026-01-01T00:00:00.000Z",
    attempts: 0,
    ...overrides,
  };
}

describe("loadOutbox", () => {
  it("returns no items when the key is missing", () => {
    const storage = createFakeStorage();

    expect(loadOutbox(storage)).toEqual({ items: [], discarded: 0 });
  });

  it("returns no items when the value is an empty string", () => {
    const storage = createFakeStorage({ [OUTBOX_KEY]: "" });

    expect(loadOutbox(storage)).toEqual({ items: [], discarded: 0 });
  });

  it("returns no items when the value is invalid JSON", () => {
    const storage = createFakeStorage({ [OUTBOX_KEY]: "not valid json{{" });

    expect(loadOutbox(storage)).toEqual({ items: [], discarded: 1 });
  });

  it("returns no items when the value is not an array", () => {
    const storage = createFakeStorage({
      [OUTBOX_KEY]: JSON.stringify({ id: "id-1" }),
    });

    expect(loadOutbox(storage)).toEqual({ items: [], discarded: 1 });
  });

  it("keeps valid entries and counts invalid ones as discarded", () => {
    const validOne = makeItem({ id: "id-1" });
    const validTwo = makeItem({ id: "id-2", name: "Grace Hopper" });
    const invalidEntries = [
      42,
      null,
      "a string",
      { id: "broken" },
      { ...makeItem(), attempts: "three" },
    ];
    const storage = createFakeStorage({
      [OUTBOX_KEY]: JSON.stringify([validOne, ...invalidEntries, validTwo]),
    });

    const result = loadOutbox(storage);

    expect(result.items).toEqual([validOne, validTwo]);
    expect(result.discarded).toBe(invalidEntries.length);
  });
});

describe("saveOutbox", () => {
  it("serializes the items and returns true", () => {
    const storage = createFakeStorage();
    const items = [makeItem()];

    expect(saveOutbox(storage, items)).toBe(true);
    expect(JSON.parse(storage.map.get(OUTBOX_KEY) as string)).toEqual(items);
  });

  it("returns false when setItem throws", () => {
    const storage: OutboxStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };

    expect(saveOutbox(storage, [makeItem()])).toBe(false);
  });
});

describe("round trip", () => {
  it("loads back exactly what was saved", () => {
    const storage = createFakeStorage();
    const items = [
      makeItem({ id: "id-1" }),
      makeItem({ id: "id-2", attempts: 2 }),
    ];

    saveOutbox(storage, items);

    expect(loadOutbox(storage)).toEqual({ items, discarded: 0 });
  });
});

describe("addToOutbox", () => {
  it("appends a new item with a fresh id, queuedAt and attempts 0", () => {
    const storage = createFakeStorage();
    saveOutbox(storage, [makeItem({ id: "existing" })]);

    const added = addToOutbox(storage, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
    });

    expect(added.id).not.toBe("existing");
    expect(added.attempts).toBe(0);
    expect(added.queuedAt).toEqual(expect.any(String));
    expect(added.name).toBe("Ada Lovelace");
    expect(added.email).toBe("ada@example.com");
    expect(added.message).toBe("Hello there");

    const { items, discarded } = loadOutbox(storage);
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual(added);
    expect(discarded).toBe(0);
  });
});

describe("removeFromOutbox", () => {
  it("removes only the item with the given id", () => {
    const storage = createFakeStorage();
    saveOutbox(storage, [
      makeItem({ id: "id-1" }),
      makeItem({ id: "id-2" }),
    ]);

    removeFromOutbox(storage, "id-1");

    const { items } = loadOutbox(storage);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("id-2");
  });
});

describe("markAttempt", () => {
  it("increments the attempts counter of the given id", () => {
    const storage = createFakeStorage();
    saveOutbox(storage, [makeItem({ id: "id-1" })]);

    markAttempt(storage, "id-1");
    markAttempt(storage, "id-1");

    const { items } = loadOutbox(storage);
    expect(items).toHaveLength(1);
    expect(items[0]?.attempts).toBe(2);
  });
});
