import { NextResponse } from "next/server";
import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "@/lib/projectStore";
import { validateProject } from "@/lib/validateProject";

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

export async function handleProjectsGet(): Promise<Response> {
  try {
    const projects = await listProjects();
    return jsonResponse("GET", "/api/projects", 200, projects, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", "/api/projects", 500, {
      error: "Failed to load projects.",
    });
  }
}

export async function handleProjectsPost(request: Request): Promise<Response> {
  const path = "/api/projects";
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("POST", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const validation = validateProject(body as Record<string, unknown>);

  if (!validation.valid) {
    return jsonResponse("POST", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const project = await createProject(validation.data);
    return jsonResponse("POST", path, 201, project);
  } catch {
    return jsonResponse("POST", path, 500, {
      error: "Failed to save the project. Please try again.",
    });
  }
}

export async function handleProjectGet(id: string): Promise<Response> {
  const path = `/api/projects/${id}`;

  try {
    const project = await getProjectById(id);

    if (!project) {
      return jsonResponse("GET", path, 404, { error: "Project not found." });
    }

    return jsonResponse("GET", path, 200, project, {
      "Cache-Control": "no-store",
    });
  } catch {
    return jsonResponse("GET", path, 500, {
      error: "Failed to load the project.",
    });
  }
}

export async function handleProjectPut(
  request: Request,
  id: string,
): Promise<Response> {
  const path = `/api/projects/${id}`;
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return jsonResponse("PUT", path, 400, {
      error: "Request body must be valid JSON.",
    });
  }

  const validation = validateProject(body as Record<string, unknown>);

  if (!validation.valid) {
    return jsonResponse("PUT", path, 400, {
      error: "Validation failed.",
      errors: validation.errors,
    });
  }

  try {
    const project = await updateProject(id, validation.data);

    if (!project) {
      return jsonResponse("PUT", path, 404, { error: "Project not found." });
    }

    return jsonResponse("PUT", path, 200, project);
  } catch {
    return jsonResponse("PUT", path, 500, {
      error: "Failed to save the project. Please try again.",
    });
  }
}

export async function handleProjectDelete(id: string): Promise<Response> {
  const path = `/api/projects/${id}`;

  try {
    const deleted = await deleteProject(id);

    if (!deleted) {
      return jsonResponse("DELETE", path, 404, { error: "Project not found." });
    }

    return jsonResponse("DELETE", path, 200, { deleted: id });
  } catch {
    return jsonResponse("DELETE", path, 500, {
      error: "Failed to delete the project.",
    });
  }
}
