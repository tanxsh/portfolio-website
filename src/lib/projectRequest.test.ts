import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./projectStore", () => ({
  listProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "./projectStore";
import {
  handleProjectDelete,
  handleProjectGet,
  handleProjectPut,
  handleProjectsGet,
  handleProjectsPost,
} from "./projectRequest";

const storedProject = {
  id: "test-id",
  slug: "sample-project",
  title: "Sample Project",
  summary: "A summary",
  description: "A description",
  tech: ["Python"],
  link: "https://github.com/tanxsh/sample",
};

const validBody = JSON.stringify({
  title: "Sample Project",
  summary: "A summary",
  description: "A description",
  tech: ["Python"],
  link: "https://github.com/tanxsh/sample",
});

function postRequest(body: string): Request {
  return new Request("http://localhost/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

function putRequest(body: string): Request {
  return new Request("http://localhost/api/projects/test-id", {
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

describe("handleProjectsGet", () => {
  it("returns all projects with no-store", async () => {
    vi.mocked(listProjects).mockResolvedValue([storedProject]);

    const response = await handleProjectsGet();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual([storedProject]);
  });

  it("returns 500 when loading fails", async () => {
    vi.mocked(listProjects).mockRejectedValue(new Error("corrupt"));

    const response = await handleProjectsGet();

    expect(response.status).toBe(500);
  });
});

describe("handleProjectsPost", () => {
  it("returns 400 for a body that is not valid JSON", async () => {
    const response = await handleProjectsPost(postRequest("not json"));

    expect(response.status).toBe(400);
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await handleProjectsPost(
      postRequest(JSON.stringify({ title: "", link: "nope" })),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(body.errors.title).toBeDefined();
    expect(body.errors.link).toBeDefined();
  });

  it("creates the project and returns it with 201", async () => {
    vi.mocked(createProject).mockResolvedValue(storedProject);

    const response = await handleProjectsPost(postRequest(validBody));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(storedProject);
    expect(vi.mocked(createProject)).toHaveBeenCalledWith({
      title: "Sample Project",
      summary: "A summary",
      description: "A description",
      tech: ["Python"],
      link: "https://github.com/tanxsh/sample",
    });
  });

  it("returns 500 when saving fails", async () => {
    vi.mocked(createProject).mockRejectedValue(new Error("disk"));

    const response = await handleProjectsPost(postRequest(validBody));

    expect(response.status).toBe(500);
  });
});

describe("handleProjectGet", () => {
  it("returns the project with 200", async () => {
    vi.mocked(getProjectById).mockResolvedValue(storedProject);

    const response = await handleProjectGet("test-id");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(storedProject);
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(getProjectById).mockResolvedValue(undefined);

    const response = await handleProjectGet("missing-id");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Project not found." });
  });
});

describe("handleProjectPut", () => {
  it("validates, updates and returns the project with 200", async () => {
    vi.mocked(updateProject).mockResolvedValue({
      ...storedProject,
      summary: "Updated",
    });

    const response = await handleProjectPut(
      putRequest(validBody),
      "test-id",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ summary: "Updated" });
  });

  it("returns 400 for invalid fields", async () => {
    const response = await handleProjectPut(
      putRequest(JSON.stringify({ title: "  " })),
      "test-id",
    );

    expect(response.status).toBe(400);
    expect((await response.json()).errors.title).toBeDefined();
    expect(vi.mocked(updateProject)).not.toHaveBeenCalled();
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(updateProject).mockResolvedValue(undefined);

    const response = await handleProjectPut(putRequest(validBody), "missing-id");

    expect(response.status).toBe(404);
  });
});

describe("handleProjectDelete", () => {
  it("deletes the project and returns deleted id", async () => {
    vi.mocked(deleteProject).mockResolvedValue(true);

    const response = await handleProjectDelete("test-id");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: "test-id" });
  });

  it("returns 404 when the id does not exist", async () => {
    vi.mocked(deleteProject).mockResolvedValue(false);

    const response = await handleProjectDelete("missing-id");

    expect(response.status).toBe(404);
  });
});
