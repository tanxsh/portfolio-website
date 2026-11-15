import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Blog post not found
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
        Sorry, we couldn&apos;t find that blog post. It may have been renamed
        or removed.
      </p>
      <Link
        href="/blogs"
        className="mt-8 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Back to Blogs
      </Link>
    </div>
  );
}
