import Link from "next/link";
import { getEpisodes, getPosts } from "@/lib/store";
import { formatDate } from "@/lib/posts";
import StatusPill from "@/components/admin/status-pill";
import RowActions from "@/components/admin/row-actions";
import PerformanceDashboard from "@/components/admin/performance-dashboard";
import { buildOverview } from "@/lib/analytics";

// Fresh numbers on every visit — no caching so it feels real-time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOverview() {
  const posts = await getPosts({ includeDrafts: true });
  const episodes = await getEpisodes({ includeDrafts: true });

  const recent = posts.slice(0, 6);
  const lastUpdated = [...posts, ...episodes].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )[0];
  const overview = await buildOverview(posts, episodes);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Overview</h1>
          <p>
            Everything published on the Resources pages is edited here.
            {lastUpdated && (
              <> Last change: {new Date(lastUpdated.updatedAt).toLocaleString("en-US")}.</>
            )}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/admin/episodes/new">
            New episode
          </Link>
          <Link className="btn btn-primary btn-sm" href="/admin/posts/new">
            New blog post
          </Link>
        </div>
      </div>

      <PerformanceDashboard data={overview} />

      <div className="panel">
        <div className="panel-head">
          <h2>Recent blog posts</h2>
          <Link className="btn btn-quiet btn-sm" href="/admin/posts">
            View all
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {recent.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link className="admin-title-cell" href={`/admin/posts/${post.id}`}>
                    {post.title}
                  </Link>
                  <span className="admin-sub">/blog/{post.slug}</span>
                </td>
                <td>{post.tag}</td>
                <td>{formatDate(post.date)}</td>
                <td>
                  <StatusPill status={post.status} />
                </td>
                <td>
                  <RowActions kind="post" id={post.id} slug={post.slug} status={post.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Recent episodes</h2>
          <Link className="btn btn-quiet btn-sm" href="/admin/episodes">
            View all
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Episode</th>
              <th>Tag</th>
              <th>Date</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {episodes.slice(0, 4).map((ep) => (
              <tr key={ep.id}>
                <td>
                  <Link className="admin-title-cell" href={`/admin/episodes/${ep.id}`}>
                    {ep.title}
                  </Link>
                </td>
                <td>{ep.tag}</td>
                <td>{formatDate(ep.date)}</td>
                <td>
                  <StatusPill status={ep.status} />
                </td>
                <td>
                  <RowActions kind="episode" id={ep.id} status={ep.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
