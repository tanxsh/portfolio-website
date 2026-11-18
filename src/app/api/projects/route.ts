import { handleProjectsGet, handleProjectsPost } from "@/lib/projectRequest";

export async function GET() {
  return handleProjectsGet();
}

export async function POST(request: Request) {
  return handleProjectsPost(request);
}
