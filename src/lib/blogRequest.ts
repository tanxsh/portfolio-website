import { NextResponse } from "next/server";
import {
  appendBlog,
  deleteBlog,
  getBlogById,
  listBlogs,
  updateBlog,
} from "@/lib/blogStore";
import { validateBlog } from "@/lib/validateBlog";

function jsonResponse(
  method: string,
  path: string,
  status: number,
  body: unknown,
  headers?: HeadersInit,
): Response {
  console.log(`${method} ${path} ${status}`);
  return NextResponse.json(body, { status, headers });
}

export async function handleBlogsGet(): Promise<Response> {
  try {
    const blogs = await listBlogs();
    const sorted = [...blogs].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    return jsonResponse("GET", "/api/blogs", 200, sorted, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", "/api/blogs", 500, {
      error: "Failed to load blog posts.",
    });
  }
}

export async function handleBlogsPost(request: Request): Promise<Response> {
  const path = "/api/blogs";
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("POST", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateBlog({
    title: typeof fields.title === "string" ? fields.title : "",
    content: typeof fields.content === "string" ? fields.content : "",
  });

  if (!validation.valid) {
    return jsonResponse("POST", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const post = await appendBlog(validation.data);
    return jsonResponse("POST", path, 201, post);
  } catch {
    return jsonResponse("POST", path, 500, {
      error: "Failed to save your post. Please try again.",
    });
  }
}

export async function handleBlogGet(id: string): Promise<Response> {
  const path = `/api/blogs/${id}`;

  try {
    const post = await getBlogById(id);

    if (!post) {
      return jsonResponse("GET", path, 404, { error: "Blog post not found." });
    }

    return jsonResponse("GET", path, 200, post, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", path, 500, {
      error: "Failed to load the blog post.",
    });
  }
}

export async function handleBlogPut(
  request: Request,
  id: string,
): Promise<Response> {
  const path = `/api/blogs/${id}`;
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("PUT", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateBlog({
    title: typeof fields.title === "string" ? fields.title : "",
    content: typeof fields.content === "string" ? fields.content : "",
  });

  if (!validation.valid) {
    return jsonResponse("PUT", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const post = await updateBlog(id, validation.data);

    if (!post) {
      return jsonResponse("PUT", path, 404, {
        error: "Blog post not found.",
      });
    }

    return jsonResponse("PUT", path, 200, post);
  } catch {
    return jsonResponse("PUT", path, 500, {
      error: "Failed to save your post. Please try again.",
    });
  }
}

export async function handleBlogDelete(id: string): Promise<Response> {
  const path = `/api/blogs/${id}`;

  try {
    const deleted = await deleteBlog(id);

    if (!deleted) {
      return jsonResponse("DELETE", path, 404, {
        error: "Blog post not found.",
      });
    }

    return jsonResponse("DELETE", path, 200, { deleted: id });
  } catch {
    return jsonResponse("DELETE", path, 500, {
      error: "Failed to delete the blog post.",
    });
  }
}
