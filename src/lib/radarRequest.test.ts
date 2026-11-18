import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./radarStore", () => ({
  listRadarItems: vi.fn(),
  getRadarItemById: vi.fn(),
  createRadarItem: vi.fn(),
  updateRadarItem: vi.fn(),
  deleteRadarItem: vi.fn(),
}));

import {
  createRadarItem,
  deleteRadarItem,
  getRadarItemById,
  listRadarItems,
  updateRadarItem,
} from "./radarStore";
import {
  handleRadarGet,
  handleRadarItemDelete,
  handleRadarItemGet,
  handleRadarItemPut,
  handleRadarPost,
} from "./radarRequest";

const storedItem = {
  id: "test-id",
  name: "Python",
  category: "Languages",
  ring: "Adopt",
  note: "My main language",
};

const validBody = JSON.stringify({
  name: "Python",
  category: "Languages",
  ring: "Adopt",
  note: "My main language",
});

function postRequest(body: string): Request {
  return new Request("http://localhost/api/radar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

function putRequest(body: string): Request {
  return new Request("http://localhost/api/radar/test-id", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleRadarGet", () => {
  it("returns all items with no-store", async () => {
    vi.mocked(listRadarItems).mockResolvedValue([storedItem]);

    const response = await handleRadarGet();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual([storedItem]);
  });

  it("returns 500 when loading fails", async () => {
    vi.mocked(listRadarItems).mockRejectedValue(new Error("corrupt"));

    const response = await handleRadarGet();

    expect(response.status).toBe(500);
  });
});

describe("handleRadarPost", () => {
  it("returns 400 for a body that is not valid JSON", async () => {
    const response = await handleRadarPost(postRequest("not json"));

    expect(response.status).toBe(400);
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await handleRadarPost(
      postRequest(
        JSON.stringify({ name: "", category: "Databases", ring: "Maybe" }),
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(body.errors.name).toBeDefined();
    expect(body.errors.category).toBeDefined();
    expect(body.errors.ring).toBeDefined();
  });

  it("returns 400 when fields have non-string types", async () => {
    const response = await handleRadarPost(
      postRequest(JSON.stringify({ name: 5, category: 1, ring: true, note: null })),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors.name).toBeDefined();
    expect(body.errors.category).toBeDefined();
    expect(body.errors.ring).toBeDefined();
    expect(vi.mocked(createRadarItem)).not.toHaveBeenCalled();
  });

  it("creates the item and returns it with 201", async () => {
    vi.mocked(createRadarItem).mockResolvedValue(storedItem);

    const response = await handleRadarPost(postRequest(validBody));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(storedItem);
    expect(vi.mocked(createRadarItem)).toHaveBeenCalledWith({
      name: "Python",
      category: "Languages",
      ring: "Adopt",
      note: "My main language",
    });
  });

  it("returns 500 when saving fails", async () => {
    vi.mocked(createRadarItem).mockRejectedValue(new Error("disk"));

    const response = await handleRadarPost(postRequest(validBody));

    expect(response.status).toBe(500);
  });
});

describe("handleRadarItemGet", () => {
  it("returns the item with 200", async () => {
    vi.mocked(getRadarItemById).mockResolvedValue(storedItem);

    const response = await handleRadarItemGet("test-id");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(storedItem);
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(getRadarItemById).mockResolvedValue(undefined);

    const response = await handleRadarItemGet("missing-id");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Radar item not found." });
  });
});

describe("handleRadarItemPut", () => {
  it("validates, updates and returns the item with 200", async () => {
    vi.mocked(updateRadarItem).mockResolvedValue({
      ...storedItem,
      ring: "Trial",
    });

    const response = await handleRadarItemPut(
      putRequest(
        JSON.stringify({
          name: "Python",
          category: "Languages",
          ring: "Trial",
          note: "My main language",
        }),
      ),
      "test-id",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ring: "Trial" });
  });

  it("returns 400 for invalid fields", async () => {
    const response = await handleRadarItemPut(
      putRequest(JSON.stringify({ name: "  " })),
      "test-id",
    );

    expect(response.status).toBe(400);
    expect((await response.json()).errors.name).toBeDefined();
    expect(vi.mocked(updateRadarItem)).not.toHaveBeenCalled();
  });

  it("returns 400 when fields have non-string types", async () => {
    const response = await handleRadarItemPut(
      putRequest(JSON.stringify({ name: 5, category: 1, ring: true, note: null })),
      "test-id",
    );

    expect(response.status).toBe(400);
    expect(vi.mocked(updateRadarItem)).not.toHaveBeenCalled();
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(updateRadarItem).mockResolvedValue(undefined);

    const response = await handleRadarItemPut(putRequest(validBody), "missing-id");

    expect(response.status).toBe(404);
  });
});

describe("handleRadarItemDelete", () => {
  it("deletes the item and returns deleted id", async () => {
    vi.mocked(deleteRadarItem).mockResolvedValue(true);

    const response = await handleRadarItemDelete("test-id");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: "test-id" });
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(deleteRadarItem).mockResolvedValue(false);

    const response = await handleRadarItemDelete("missing-id");

    expect(response.status).toBe(404);
  });
});
