import { handleContactPost } from "@/lib/contactRequest";

export async function POST(request: Request) {
  return handleContactPost(request, "/api/contact-server-form");
}
