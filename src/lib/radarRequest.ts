import { NextResponse } from "next/server";
import {
  createRadarItem,
  deleteRadarItem,
  getRadarItemById,
  listRadarItems,
  updateRadarItem,
} from "@/lib/radarStore";
import {
  validateRadarItem,
  type RadarCategory,
  type RadarRing,
} from "@/lib/validateRadarItem";

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

export async function handleRadarGet(): Promise<Response> {
  try {
    const items = await listRadarItems();

    return jsonResponse("GET", "/api/radar", 200, items, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", "/api/radar", 500, {
      error: "Failed to load radar items.",
    });
  }
}

export async function handleRadarPost(request: Request): Promise<Response> {
  const path = "/api/radar";
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("POST", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateRadarItem({
    name: typeof fields.name === "string" ? fields.name : "",
    category: (typeof fields.category === "string"
      ? fields.category
      : "") as RadarCategory,
    ring: (typeof fields.ring === "string" ? fields.ring : "") as RadarRing,
    note: typeof fields.note === "string" ? fields.note : "",
  });

  if (!validation.valid) {
    return jsonResponse("POST", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const item = await createRadarItem(validation.data);
    return jsonResponse("POST", path, 201, item);
  } catch {
    return jsonResponse("POST", path, 500, {
      error: "Failed to save the radar item. Please try again.",
    });
  }
}

export async function handleRadarItemGet(id: string): Promise<Response> {
  const path = `/api/radar/${id}`;

  try {
    const item = await getRadarItemById(id);

    if (!item) {
      return jsonResponse("GET", path, 404, {
        error: "Radar item not found.",
      });
    }

    return jsonResponse("GET", path, 200, item, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", path, 500, {
      error: "Failed to load the radar item.",
    });
  }
}

export async function handleRadarItemPut(
  request: Request,
  id: string,
): Promise<Response> {
  const path = `/api/radar/${id}`;
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("PUT", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const fields = body as Record<string, unknown>;
  const validation = validateRadarItem({
    name: typeof fields.name === "string" ? fields.name : "",
    category: (typeof fields.category === "string"
      ? fields.category
      : "") as RadarCategory,
    ring: (typeof fields.ring === "string" ? fields.ring : "") as RadarRing,
    note: typeof fields.note === "string" ? fields.note : "",
  });

  if (!validation.valid) {
    return jsonResponse("PUT", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const item = await updateRadarItem(id, validation.data);

    if (!item) {
      return jsonResponse("PUT", path, 404, {
        error: "Radar item not found.",
      });
    }

    return jsonResponse("PUT", path, 200, item);
  } catch {
    return jsonResponse("PUT", path, 500, {
      error: "Failed to save the radar item. Please try again.",
    });
  }
}

export async function handleRadarItemDelete(id: string): Promise<Response> {
  const path = `/api/radar/${id}`;

  try {
    const deleted = await deleteRadarItem(id);

    if (!deleted) {
      return jsonResponse("DELETE", path, 404, {
        error: "Radar item not found.",
      });
    }

    return jsonResponse("DELETE", path, 200, { deleted: id });
  } catch {
    return jsonResponse("DELETE", path, 500, {
      error: "Failed to delete the radar item.",
    });
  }
}
