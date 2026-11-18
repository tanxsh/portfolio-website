import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectBySlug,
  listProjects,
  updateProject,
} from "./projectStore";

const validProject = {
  title: "Sample Project",
  summary: "A summary",
  description: "A description",
  tech: ["Python"],
  link: "https://github.com/tanxsh/sample",
};

describe("projectStore", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "project-store-"));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("returns an empty list when the file is missing", async () => {
    expect(await listProjects(dataDir)).toEqual([]);
    expect(await getProjectById("any-id", dataDir)).toBeUndefined();
    expect(await getProjectBySlug("any-slug", dataDir)).toBeUndefined();
  });

  it("creates a project with a generated id and slug", async () => {
    const stored = await createProject(validProject, dataDir);

    expect(stored.id).toBeTruthy();
    expect(stored.slug).toBe("sample-project");
    expect(stored.title).toBe("Sample Project");
    expect(stored.link).toBe("https://github.com/tanxsh/sample");

    const projects = await listProjects(dataDir);
    expect(projects).toHaveLength(1);
    expect(projects[0]).toEqual(stored);
  });

  it("makes slugs unique by appending -2 for repeated titles", async () => {
    const first = await createProject(validProject, dataDir);
    const second = await createProject(validProject, dataDir);

    expect(first.slug).toBe("sample-project");
    expect(second.slug).toBe("sample-project-2");
  });

  it("finds projects by id and by slug", async () => {
    const stored = await createProject(validProject, dataDir);

    expect((await getProjectById(stored.id, dataDir))?.slug).toBe(
      "sample-project",
    );
    expect((await getProjectBySlug("sample-project", dataDir))?.id).toBe(
      stored.id,
    );
    expect(await getProjectById("missing", dataDir)).toBeUndefined();
    expect(await getProjectBySlug("missing", dataDir)).toBeUndefined();
  });

  it("updates a project keeping its id and slug, or returns undefined", async () => {
    const stored = await createProject(validProject, dataDir);

    const updated = await updateProject(
      stored.id,
      { summary: "New summary", tech: ["Go"] },
      dataDir,
    );

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(stored.id);
    expect(updated?.slug).toBe("sample-project");
    expect(updated?.summary).toBe("New summary");
    expect(updated?.tech).toEqual(["Go"]);
    expect(updated?.title).toBe("Sample Project");

    expect(await updateProject("missing-id", { summary: "x" }, dataDir)).toBeUndefined();
  });

  it("deletes a project and reports whether it existed", async () => {
    const stored = await createProject(validProject, dataDir);

    expect(await deleteProject(stored.id, dataDir)).toBe(true);
    expect(await listProjects(dataDir)).toEqual([]);
    expect(await deleteProject(stored.id, dataDir)).toBe(false);
  });

  it("throws on a corrupt JSON file and leaves it unchanged", async () => {
    const corrupt = "{ not valid json";
    await writeFile(path.join(dataDir, "projects.json"), corrupt, "utf8");

    await expect(createProject(validProject, dataDir)).rejects.toThrow();
    await expect(listProjects(dataDir)).rejects.toThrow();

    expect(await readFile(path.join(dataDir, "projects.json"), "utf8")).toBe(
      corrupt,
    );
    expect(existsSync(path.join(dataDir, "projects.json.tmp"))).toBe(false);
  });
});
