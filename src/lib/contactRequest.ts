import { NextResponse } from "next/server";
import {
  appendContact,
  deleteContact,
  getContactById,
  listContacts,
  updateContact,
} from "@/lib/contactStore";
import { validateContact } from "@/lib/validateContact";

function jsonResponse(
  method: string,
  path: string,
  status: number,
  body: unknown,
  headers?: HeadersInit,
): Response {
  console.log(`${method} ${path} ${status}`);
  return NextResponse.json(body, { status, headers });
}

export async function handleContactsGet(): Promise<Response> {
  try {
    const contacts = await listContacts();
    const sorted = [...contacts].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );

    return jsonResponse("GET", "/api/contact", 200, sorted, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", "/api/contact", 500, {
      error: "Failed to load contact submissions.",
    });
  }
}

export async function handleContactPost(
  request: Request,
  path: string,
): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("POST", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateContact({
    name: typeof fields.name === "string" ? fields.name : "",
    email: typeof fields.email === "string" ? fields.email : "",
    message: typeof fields.message === "string" ? fields.message : "",
  });

  if (!validation.valid) {
    return jsonResponse("POST", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    await appendContact(validation.data);
  } catch {
    return jsonResponse("POST", path, 500, {
      error: "Failed to save your message. Please try again.",
    });
  }

  return jsonResponse("POST", path, 201, {
    message: "Thanks! Your message has been received.",
  });
}

export async function handleContactGet(id: string): Promise<Response> {
  const path = `/api/contact/${id}`;

  try {
    const contact = await getContactById(id);

    if (!contact) {
      return jsonResponse("GET", path, 404, { error: "Contact not found." });
    }

    return jsonResponse("GET", path, 200, contact, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", path, 500, {
      error: "Failed to load the contact submission.",
    });
  }
}

export async function handleContactPut(
  request: Request,
  id: string,
): Promise<Response> {
  const path = `/api/contact/${id}`;
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("PUT", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateContact({
    name: typeof fields.name === "string" ? fields.name : "",
    email: typeof fields.email === "string" ? fields.email : "",
    message: typeof fields.message === "string" ? fields.message : "",
  });

  if (!validation.valid) {
    return jsonResponse("PUT", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const contact = await updateContact(id, validation.data);

    if (!contact) {
      return jsonResponse("PUT", path, 404, { error: "Contact not found." });
    }

    return jsonResponse("PUT", path, 200, contact);
  } catch {
    return jsonResponse("PUT", path, 500, {
      error: "Failed to save the contact submission. Please try again.",
    });
  }
}

export async function handleContactDelete(id: string): Promise<Response> {
  const path = `/api/contact/${id}`;

  try {
    const deleted = await deleteContact(id);

    if (!deleted) {
      return jsonResponse("DELETE", path, 404, {
        error: "Contact not found.",
      });
    }

    return jsonResponse("DELETE", path, 200, { deleted: id });
  } catch {
    return jsonResponse("DELETE", path, 500, {
      error: "Failed to delete the contact submission.",
    });
  }
}
