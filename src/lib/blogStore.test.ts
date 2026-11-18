import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  listBlogs,
  slugifyTitle,
  updateBlog,
} from "./blogStore";

describe("slugifyTitle", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugifyTitle("Hello World")).toBe("hello-world");
  });

  it("removes punctuation and collapses separators", () => {
    expect(slugifyTitle("Hello, World!")).toBe("hello-world");
    expect(slugifyTitle("Tips & Tricks: Part 2")).toBe("tips-tricks-part-2");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyTitle("-- My Title --")).toBe("my-title");
  });

  it("returns 'post' when the title has no alphanumeric characters", () => {
    expect(slugifyTitle("!!! ???")).toBe("post");
    expect(slugifyTitle("")).toBe("post");
  });
});

describe("blogStore", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "blog-store-"));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("returns an empty list when the file is missing", async () => {
    expect(await listBlogs(dataDir)).toEqual([]);
    expect(await getBlogBySlug("anything", dataDir)).toBeUndefined();
  });

  it("returns an empty list when the file is empty", async () => {
    await writeFile(path.join(dataDir, "blogs.json"), "", "utf8");

    expect(await listBlogs(dataDir)).toEqual([]);
    expect(await getBlogBySlug("anything", dataDir)).toBeUndefined();
  });

  it("appends a post with generated slug, excerpt, id, and createdAt", async () => {
    const stored = await appendBlog(
      { title: "Hello World", content: "First post body" },
      dataDir,
    );

    expect(stored.slug).toBe("hello-world");
    expect(stored.excerpt).toBe("First post body");
    expect(stored.id).toBeTruthy();
    expect(stored.createdAt).toBeTruthy();

    const blogs = await listBlogs(dataDir);
    expect(blogs).toHaveLength(1);
    expect(blogs[0]).toEqual(stored);
  });

  it("makes slugs unique by appending -2 and -3 for repeated titles", async () => {
    const first = await appendBlog(
      { title: "Hello World", content: "one" },
      dataDir,
    );
    const second = await appendBlog(
      { title: "Hello World", content: "two" },
      dataDir,
    );
    const third = await appendBlog(
      { title: "Hello World", content: "three" },
      dataDir,
    );

    expect(first.slug).toBe("hello-world");
    expect(second.slug).toBe("hello-world-2");
    expect(third.slug).toBe("hello-world-3");
  });

  it("finds a post by slug", async () => {
    await appendBlog({ title: "Find Me", content: "body" }, dataDir);

    const found = await getBlogBySlug("find-me", dataDir);
    expect(found?.title).toBe("Find Me");
    expect(await getBlogBySlug("missing", dataDir)).toBeUndefined();
  });

  it("finds a post by id", async () => {
    const stored = await appendBlog(
      { title: "By Id", content: "body" },
      dataDir,
    );

    expect((await getBlogById(stored.id, dataDir))?.slug).toBe("by-id");
    expect(await getBlogById("missing", dataDir)).toBeUndefined();
  });

  it("updates title and content, regenerating the excerpt but keeping id, slug and createdAt", async () => {
    const stored = await appendBlog(
      { title: "Original Title", content: "Original content" },
      dataDir,
    );

    const updated = await updateBlog(
      stored.id,
      { title: "Updated Title", content: "Brand new content" },
      dataDir,
    );

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(stored.id);
    expect(updated?.slug).toBe("original-title");
    expect(updated?.createdAt).toBe(stored.createdAt);
    expect(updated?.title).toBe("Updated Title");
    expect(updated?.content).toBe("Brand new content");
    expect(updated?.excerpt).toBe("Brand new content");
    expect((await listBlogs(dataDir))[0].title).toBe("Updated Title");
  });

  it("returns undefined when updating a missing id", async () => {
    expect(
      await updateBlog("missing", { title: "T", content: "C" }, dataDir),
    ).toBeUndefined();
  });

  it("deletes a blog and reports whether it existed", async () => {
    const stored = await appendBlog(
      { title: "Delete Me", content: "body" },
      dataDir,
    );

    expect(await deleteBlog(stored.id, dataDir)).toBe(true);
    expect(await listBlogs(dataDir)).toEqual([]);
    expect(await deleteBlog(stored.id, dataDir)).toBe(false);
  });

  it("throws on a corrupt JSON file and leaves it unchanged", async () => {
    const corrupt = "{ not valid json";
    await writeFile(path.join(dataDir, "blogs.json"), corrupt, "utf8");

    await expect(
      appendBlog({ title: "Title", content: "Content" }, dataDir),
    ).rejects.toThrow();
    await expect(listBlogs(dataDir)).rejects.toThrow();

    expect(await readFile(path.join(dataDir, "blogs.json"), "utf8")).toBe(
      corrupt,
    );
    expect(existsSync(path.join(dataDir, "blogs.json.tmp"))).toBe(false);
  });
});
