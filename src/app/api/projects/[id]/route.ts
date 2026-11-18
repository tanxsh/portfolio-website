import {
  handleProjectDelete,
  handleProjectGet,
  handleProjectPut,
} from "@/lib/projectRequest";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[id]">,
) {
  const { id } = await ctx.params;
  return handleProjectGet(id);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[id]">,
) {
  const { id } = await ctx.params;
  return handleProjectPut(request, id);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[id]">,
) {
  const { id } = await ctx.params;
  return handleProjectDelete(id);
}
