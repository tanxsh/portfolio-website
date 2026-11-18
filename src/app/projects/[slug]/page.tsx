import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { getProjectBySlug } from "@/lib/projectStore";

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  await connection();
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  return { title: project ? project.title : "Project" };
}

async function ProjectContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div>
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

function ProjectSkeleton() {
  return <p className="text-zinc-600 dark:text-zinc-400">Loading project…</p>;
}

export default function ProjectPage(props: PageProps<"/projects/[slug]">) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Suspense fallback={<ProjectSkeleton />}>
        <ProjectContent params={props.params} />
      </Suspense>
    </div>
  );
}
