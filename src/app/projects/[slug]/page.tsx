import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? project.title : "Project" };
}

export default async function ProjectPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Project</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        {project.summary}
      </p>

      <h2 className="mt-8 text-lg font-medium">Tech</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <li
            key={item}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            {item}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-medium">About this project</h2>
      <p className="mt-3 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>

      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        View Project
      </a>
    </div>
  );
}
