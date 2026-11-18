import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";
import { slugifyTitle, uniqueSlug } from "./slug";
import type { ProjectFields } from "./validateProject";

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tech: string[];
  link: string;
};

const defaultDataDir = path.join(process.cwd(), "data");

export async function listProjects(
  dataDir: string = defaultDataDir,
): Promise<Project[]> {
  return readJsonArrayFile<Project>(path.join(dataDir, "projects.json"));
}

export async function getProjectById(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<Project | undefined> {
  const projects = await listProjects(dataDir);
  return projects.find((project) => project.id === id);
}

export async function getProjectBySlug(
  slug: string,
  dataDir: string = defaultDataDir,
): Promise<Project | undefined> {
  const projects = await listProjects(dataDir);
  return projects.find((project) => project.slug === slug);
}

export async function createProject(
  fields: ProjectFields,
  dataDir: string = defaultDataDir,
): Promise<Project> {
  const projectsFile = path.join(dataDir, "projects.json");
  const projects = await readJsonArrayFile<Project>(projectsFile);

  const stored: Project = {
    id: crypto.randomUUID(),
    slug: uniqueSlug(
      slugifyTitle(fields.title),
      new Set(projects.map((project) => project.slug)),
    ),
    ...fields,
  };

  projects.push(stored);
  await writeJsonArrayFile(projectsFile, projects);

  return stored;
}

export async function updateProject(
  id: string,
  patch: Partial<ProjectFields>,
  dataDir: string = defaultDataDir,
): Promise<Project | undefined> {
  const projectsFile = path.join(dataDir, "projects.json");
  const projects = await readJsonArrayFile<Project>(projectsFile);

  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: Project = { ...projects[index], ...patch };
  projects[index] = updated;
  await writeJsonArrayFile(projectsFile, projects);

  return updated;
}

export async function deleteProject(
  id: string,
  dataDir: string = defaultDataDir,
): Promise<boolean> {
  const projectsFile = path.join(dataDir, "projects.json");
  const projects = await readJsonArrayFile<Project>(projectsFile);

  const remaining = projects.filter((project) => project.id !== id);
  if (remaining.length === projects.length) {
    return false;
  }

  await writeJsonArrayFile(projectsFile, remaining);
  return true;
}
