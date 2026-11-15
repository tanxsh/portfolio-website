import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        A few things I&apos;ve built.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug} className="h-full">
            <Link
              href={`/projects/${project.slug}`}
              className="card flex h-full flex-col"
            >
              <h2 className="text-base font-medium text-foreground">
                {project.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                {project.summary}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <li key={item} className="pill">
                    {item}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
