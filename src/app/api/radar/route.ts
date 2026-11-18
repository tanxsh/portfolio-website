import { handleRadarGet, handleRadarPost } from "@/lib/radarRequest";

export async function GET() {
  return handleRadarGet();
}

export async function POST(request: Request) {
  return handleRadarPost(request);
}
