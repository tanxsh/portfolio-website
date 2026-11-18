"use client";

import { useEffect, useState } from "react";
import ProjectForm from "@/components/ProjectForm";
import type { Project } from "@/lib/projectStore";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as Project[];
        if (!cancelled) {
          setProjects(data);
          setListError(null);
        }
      } catch {
        if (!cancelled) {
          setListError("Failed to load projects. Please try again later.");
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this project? This cannot be undone.")) {
      return;
    }

    setBusyId(id);
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (editing?.id === id) {
        setEditing(null);
      }
      setRefreshKey((key) => key + 1);
    } catch {
      setListError("Failed to delete the project. Please try again later.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-medium">
          {editing ? "Edit project" : "New project"}
        </h2>
        <ProjectForm
          key={editing?.id ?? "new"}
          project={editing}
          onSaved={() => setRefreshKey((key) => key + 1)}
          onReset={() => setEditing(null)}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium">All projects</h2>

        {listError && <p className="banner-error mt-4">{listError}</p>}

        {projects === null && !listError && (
          <p className="mt-4 text-muted">Loading projects…</p>
        )}

        {projects !== null && projects.length === 0 && (
          <p className="mt-4 text-muted">No projects yet</p>
        )}

        {projects !== null && projects.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="card flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {project.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    /projects/{project.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(project)}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    disabled={busyId === project.id}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
