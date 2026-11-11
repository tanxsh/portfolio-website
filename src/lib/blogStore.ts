import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";
import type { BlogFields } from "./validateBlog";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
};

const defaultDataDir = path.join(process.cwd(), "data");
const EXCERPT_LENGTH = 160;

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "post";
}

export async function appendBlog(
  post: BlogFields,
  dataDir: string = defaultDataDir,
): Promise<BlogPost> {
  const blogsFile = path.join(dataDir, "blogs.json");
  const blogs = await readJsonArrayFile<BlogPost>(blogsFile);

  const stored: BlogPost = {
    id: crypto.randomUUID(),
    slug: uniqueSlug(slugifyTitle(post.title), blogs),
    title: post.title,
    excerpt: toExcerpt(post.content),
    content: post.content,
    createdAt: new Date().toISOString(),
  };

  blogs.push(stored);
  await writeJsonArrayFile(blogsFile, blogs);

  return stored;
}

export async function listBlogs(
  dataDir: string = defaultDataDir,
): Promise<BlogPost[]> {
  return readJsonArrayFile<BlogPost>(path.join(dataDir, "blogs.json"));
}

export async function getBlogBySlug(
  slug: string,
  dataDir: string = defaultDataDir,
): Promise<BlogPost | undefined> {
  const blogs = await listBlogs(dataDir);
  return blogs.find((blog) => blog.slug === slug);
}

function uniqueSlug(base: string, existing: BlogPost[]): string {
  const taken = new Set(existing.map((blog) => blog.slug));

  let candidate = base;
  let counter = 2;

  while (taken.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function toExcerpt(content: string): string {
  if (content.length <= EXCERPT_LENGTH) {
    return content;
  }
  return `${content.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
}
