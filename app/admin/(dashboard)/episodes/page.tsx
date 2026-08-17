import Link from "next/link";
import { getEpisodes } from "@/lib/store";
import { formatDate } from "@/lib/posts";
import StatusPill from "@/components/admin/status-pill";
import RowActions from "@/components/admin/row-actions";

export default async function EpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const episodes = await getEpisodes({ includeDrafts: true });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Podcast episodes</h1>
          <p>{episodes.length} episodes on the Psychiatry Perspectives page.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/podcast" target="_blank">
            View page ↗
          </Link>
          <Link className="btn btn-primary btn-sm" href="/admin/episodes/new">
            New episode
          </Link>
        </div>
      </div>

      {deleted && <div className="alert alert-ok">Episode deleted.</div>}

      <div className="panel">
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
            {episodes.map((ep) => (
              <tr key={ep.id}>
                <td>
                  <Link className="admin-title-cell" href={`/admin/episodes/${ep.id}`}>
                    {ep.title}
                  </Link>
                  <span className="admin-sub">{ep.slug}</span>
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
            {episodes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No episodes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
