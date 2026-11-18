import {
  handleRadarItemDelete,
  handleRadarItemGet,
  handleRadarItemPut,
} from "@/lib/radarRequest";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/radar/[id]">,
) {
  const { id } = await ctx.params;
  return handleRadarItemGet(id);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/radar/[id]">,
) {
  const { id } = await ctx.params;
  return handleRadarItemPut(request, id);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/radar/[id]">,
) {
  const { id } = await ctx.params;
  return handleRadarItemDelete(id);
}
