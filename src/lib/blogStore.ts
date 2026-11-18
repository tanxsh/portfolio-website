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

function toExcerpt(content: string): string {
  if (content.length <= EXCERPT_LENGTH) {
    return content;
  }
  return `${content.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
}
