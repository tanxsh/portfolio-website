import Link from "next/link";
import type { Project } from "@/lib/projectStore";

export type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <li className="h-full">
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
  );
}
