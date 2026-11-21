import Link from "next/link";
import { formatDate } from "@/lib/blogFormat";
import type { BlogPost } from "@/lib/blogStore";

export type BlogCardProps = {
  post: BlogPost;
};

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <li>
      <Link
        href={`/blogs/${post.slug}`}
        className="card block"
      >
        <h2 className="text-base font-medium text-foreground">
          {post.title}
        </h2>
        <p className="mt-1 text-xs text-accent">
          {formatDate(post.createdAt)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {post.excerpt}
        </p>
      </Link>
    </li>
  );
}
