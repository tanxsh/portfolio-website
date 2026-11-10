import { NextResponse } from "next/server";
import { appendContact } from "@/lib/contactStore";
import { validateContact } from "@/lib/validateContact";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;
  const validation = validateContact({
    name: typeof fields.name === "string" ? fields.name : "",
    email: typeof fields.email === "string" ? fields.email : "",
    message: typeof fields.message === "string" ? fields.message : "",
  });

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed.", errors: validation.errors },
      { status: 400 },
    );
  }

  try {
    await appendContact(validation.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to save your message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Thanks! Your message has been received." },
    { status: 201 },
  );
}
