import {
  handleBlogDelete,
  handleBlogGet,
  handleBlogPut,
} from "@/lib/blogRequest";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/blogs/[id]">,
) {
  const { id } = await ctx.params;
  return handleBlogGet(id);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/blogs/[id]">,
) {
  const { id } = await ctx.params;
  return handleBlogPut(request, id);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/blogs/[id]">,
) {
  const { id } = await ctx.params;
  return handleBlogDelete(id);
}
