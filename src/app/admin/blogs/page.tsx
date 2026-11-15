import type { Metadata } from "next";
import BlogForm from "@/components/BlogForm";

export const metadata: Metadata = {
  title: "Blog Admin",
};

export default function BlogAdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog Admin</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Publish a new post to your blog.
      </p>
      <BlogForm />
    </div>
  );
}
