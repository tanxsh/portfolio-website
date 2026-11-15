import { NextResponse } from "next/server";
import { appendBlog, listBlogs } from "@/lib/blogStore";
import { validateBlog } from "@/lib/validateBlog";

export async function handleBlogsGet(): Promise<Response> {
  try {
    const blogs = await listBlogs();
    const sorted = [...blogs].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    return NextResponse.json(sorted, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load blog posts." },
      { status: 500 },
    );
  }
}

export async function handleBlogPost(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;
  const validation = validateBlog({
    title: typeof fields.title === "string" ? fields.title : "",
    content: typeof fields.content === "string" ? fields.content : "",
  });

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed.", errors: validation.errors },
      { status: 400 },
    );
  }

  try {
    const post = await appendBlog(validation.data);
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save your post. Please try again." },
      { status: 500 },
    );
  }
}
