import Link from "next/link";
import { getPosts } from "@/lib/store";
import { AUTHORS, formatDate } from "@/lib/posts";
import StatusPill from "@/components/admin/status-pill";
import RowActions from "@/components/admin/row-actions";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string }>;
}) {
  const { status, deleted } = await searchParams;
  const all = await getPosts({ includeDrafts: true });
  const posts = status === "draft" || status === "published"
    ? all.filter((p) => p.status === status)
    : all;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Blog posts</h1>
          <p>{all.length} posts · edits go live as soon as you publish.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/admin/posts">
            All
          </Link>
          <Link className="btn btn-quiet btn-sm" href="/admin/posts?status=published">
            Published
          </Link>
          <Link className="btn btn-quiet btn-sm" href="/admin/posts?status=draft">
            Drafts
          </Link>
          <Link className="btn btn-primary btn-sm" href="/admin/posts/new">
            New post
          </Link>
        </div>
      </div>

      {deleted && <div className="alert alert-ok">Post deleted.</div>}

      <div className="panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Read</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link className="admin-title-cell" href={`/admin/posts/${post.id}`}>
                    {post.title}
                    {post.featured ? " ★" : ""}
                  </Link>
                  <span className="admin-sub">/blog/{post.slug}</span>
                </td>
                <td>{AUTHORS[post.author].name}</td>
                <td>{formatDate(post.date)}</td>
                <td>{post.readTime} min</td>
                <td>
                  <StatusPill status={post.status} />
                </td>
                <td>
                  <RowActions kind="post" id={post.id} slug={post.slug} status={post.status} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
