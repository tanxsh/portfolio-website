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
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="block h-full rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <h2 className="font-medium">{project.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {project.summary}
              </p>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                {project.tech.join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
