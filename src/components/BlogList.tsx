"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import type { BlogPost } from "@/lib/blogStore";

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as BlogPost[];
        if (!cancelled) {
          setPosts(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load blog posts. Please try again later.");
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {loadError && (
        <p
          role="alert"
          className="mt-8 rounded-lg border border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {loadError}
        </p>
      )}

      {!loadError && posts === null && (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">Loading posts…</p>
      )}

      {posts !== null && posts.length === 0 && (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">No posts yet</p>
      )}

      {posts !== null && posts.length > 0 && (
        <ul className="mt-8 flex flex-col gap-4">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
