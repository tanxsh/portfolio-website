import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import ProjectCard from "@/components/ProjectCard";
import { listProjects } from "@/lib/projectStore";

export const metadata: Metadata = {
  title: "Projects",
};

function ProjectsSkeleton() {
  return (
    <p className="mt-8 text-zinc-600 dark:text-zinc-400">Loading projects…</p>
  );
}

async function ProjectsList() {
  await connection();
  const projects = await listProjects();

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </ul>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        A few things I&apos;ve built.
      </p>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList />
      </Suspense>
    </div>
  );
}
