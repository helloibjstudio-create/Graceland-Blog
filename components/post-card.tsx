import Link from "next/link";
import Media from "./media";
import { AUTHORS, formatDate, type Post } from "@/lib/posts";

export function tagClass(variant: Post["variant"]) {
  return variant === "blue" ? "tag" : `tag tag-${variant}`;
}

export default function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const author = AUTHORS[post.author];

  return (
    <article
      className="post-card"
      data-post
      data-topic={post.topic}
      data-author={post.author}
    >
      <Link className="post-card-cover" href={`/blog/${post.slug}`} aria-label={post.title}>
        <Media src={post.image} />
      </Link>
      <div className="post-body">
        <span className={tagClass(post.variant)}>{post.tag}</span>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {!compact && <p className="post-excerpt">{post.excerpt}</p>}
        <div className="post-foot">
          {compact ? (
            <span className="byline-meta">{formatDate(post.date)}</span>
          ) : (
            <div className="byline">
              <span className="avatar">{author.initials}</span>
              <span>
                <span className="byline-name">{author.name}</span>
                <span className="byline-meta">{formatDate(post.date)}</span>
              </span>
            </div>
          )}
          <span className="byline-meta">{post.readTime} min</span>
        </div>
      </div>
    </article>
  );
}
