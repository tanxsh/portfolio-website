import { handleBlogsGet, handleBlogPost } from "@/lib/blogRequest";

export async function GET() {
  return handleBlogsGet();
}

export async function POST(request: Request) {
  return handleBlogPost(request);
}
