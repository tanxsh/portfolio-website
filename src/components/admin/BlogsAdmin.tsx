"use client";

import { useEffect, useState } from "react";
import BlogForm from "@/components/BlogForm";
import type { BlogPost } from "@/lib/blogStore";

export default function BlogsAdmin() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
          setListError(null);
        }
      } catch {
        if (!cancelled) {
          setListError("Failed to load blog posts. Please try again later.");
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    setBusyId(id);
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (editing?.id === id) {
        setEditing(null);
      }
      setRefreshKey((key) => key + 1);
    } catch {
      setListError("Failed to delete the blog post. Please try again later.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-medium">
          {editing ? "Edit post" : "New post"}
        </h2>
        <BlogForm
          key={editing?.id ?? "new"}
          post={editing}
          onSaved={() => setRefreshKey((key) => key + 1)}
          onReset={() => setEditing(null)}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium">All posts</h2>

        {listError && <p className="banner-error mt-4">{listError}</p>}

        {posts === null && !listError && (
          <p className="mt-4 text-muted">Loading posts…</p>
        )}

        {posts !== null && posts.length === 0 && (
          <p className="mt-4 text-muted">No posts yet</p>
        )}

        {posts !== null && posts.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="card flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {post.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">/blogs/{post.slug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(post)}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={busyId === post.id}
                    className="btn-secondary px-4 py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
