import {
  handleContactDelete,
  handleContactGet,
  handleContactPut,
} from "@/lib/contactRequest";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/contact/[id]">,
) {
  const { id } = await ctx.params;
  return handleContactGet(id);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/contact/[id]">,
) {
  const { id } = await ctx.params;
  return handleContactPut(request, id);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/contact/[id]">,
) {
  const { id } = await ctx.params;
  return handleContactDelete(id);
}
