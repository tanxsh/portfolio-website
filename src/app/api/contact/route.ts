import { handleContactPost, handleContactsGet } from "@/lib/contactRequest";

export async function GET() {
  return handleContactsGet();
}

export async function POST(request: Request) {
  return handleContactPost(request, "/api/contact");
}
