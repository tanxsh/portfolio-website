import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";
import { slugifyTitle as slugify, uniqueSlug } from "./slug";
import type { BlogFields } from "./validateBlog";

export { slugifyTitle } from "./slug";

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

export async function appendBlog(
  post: BlogFields,
  dataDir: string = defaultDataDir,
): Promise<BlogPost> {
  const blogsFile = path.join(dataDir, "blogs.json");
  const blogs = await readJsonArrayFile<BlogPost>(blogsFile);

  const stored: BlogPost = {
    id: crypto.randomUUID(),
    slug: uniqueSlug(
      slugify(post.title),
      new Set(blogs.map((blog) => blog.slug)),
    ),
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

export async function getBlogById(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<BlogPost | undefined> {
  const blogs = await listBlogs(dataDir);
  return blogs.find((blog) => blog.id === id);
}

export async function updateBlog(
  id: string,
  fields: BlogFields,
  dataDir: string = defaultDataDir,
): Promise<BlogPost | undefined> {
  const blogsFile = path.join(dataDir, "blogs.json");
  const blogs = await readJsonArrayFile<BlogPost>(blogsFile);

  const index = blogs.findIndex((blog) => blog.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: BlogPost = {
    ...blogs[index],
    title: fields.title,
    excerpt: toExcerpt(fields.content),
    content: fields.content,
  };

  blogs[index] = updated;
  await writeJsonArrayFile(blogsFile, blogs);

  return updated;
}

export async function deleteBlog(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<boolean> {
  const blogsFile = path.join(dataDir, "blogs.json");
  const blogs = await readJsonArrayFile<BlogPost>(blogsFile);

  const remaining = blogs.filter((blog) => blog.id !== id);
  if (remaining.length === blogs.length) {
    return false;
  }

  await writeJsonArrayFile(blogsFile, remaining);
  return true;
}

function toExcerpt(content: string): string {
  if (content.length <= EXCERPT_LENGTH) {
    return content;
  }
  return `${content.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
}
