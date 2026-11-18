import type { Metadata } from "next";
import ProjectsAdmin from "@/components/admin/ProjectsAdmin";

export const metadata: Metadata = {
  title: "Projects Admin",
};

export default function ProjectsAdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects Admin</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage your projects.
      </p>
      <ProjectsAdmin />
    </div>
  );
}
