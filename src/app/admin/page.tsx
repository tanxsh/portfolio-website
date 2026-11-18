import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
};

const adminAreas = [
  {
    href: "/admin/blogs",
    title: "Blogs",
    description: "Publish new blog posts.",
  },
  {
    href: "/admin/projects",
    title: "Projects",
    description: "Create, edit, and delete portfolio projects.",
  },
  {
    href: "/admin/contacts",
    title: "Contacts",
    description: "Review, edit, and delete contact submissions.",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {adminAreas.map((area) => (
          <li key={area.href} className="h-full">
            <Link href={area.href} className="card flex h-full flex-col">
              <h2 className="text-base font-medium text-foreground">
                {area.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {area.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
