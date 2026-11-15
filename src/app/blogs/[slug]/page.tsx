import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getBlogBySlug } from "@/lib/blogStore";
import { formatDate } from "@/lib/blogFormat";

function PostSkeleton() {
  return (
    <p className="mt-8 text-zinc-600 dark:text-zinc-400">Loading post…</p>
  );
}

async function BlogPostContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {formatDate(post.createdAt)}
      </p>
      <div className="mt-8 max-w-2xl">
        {post.content.split(/\n{2,}/).map((paragraph, index) => (
          <p
            key={index}
            className="leading-7 text-zinc-600 [&:not(:first-child)]:mt-4 dark:text-zinc-400"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export default function BlogPostPage(
  props: PageProps<"/blogs/[slug]">,
) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Suspense fallback={<PostSkeleton />}>
        <BlogPostContent params={props.params} />
      </Suspense>
      <Link
        href="/blogs"
        className="mt-12 inline-block text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Back to all posts
      </Link>
    </div>
  );
}
