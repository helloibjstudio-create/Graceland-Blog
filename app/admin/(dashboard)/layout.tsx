import Image from "next/image";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getEpisodes, getPosts } from "@/lib/store";
import AdminNav from "@/components/admin/admin-nav";
import { logoutAction } from "../actions";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const posts = await getPosts({ includeDrafts: true });
  const episodes = await getEpisodes({ includeDrafts: true });

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" href="/admin">
          <Image
            src="/images/graceland-logo.svg"
            alt="Graceland Psychiatry & TMS Center"
            width={160}
            height={34}
            className="site-logo site-logo--white"
          />
          <span className="brand-sub" style={{ color: "rgba(255,255,255,.6)", fontSize: ".65rem", marginTop: 2 }}>Content Studio</span>
        </Link>

        <div>
          <p className="admin-side-label">Content</p>
          <AdminNav postCount={posts.length} episodeCount={episodes.length} />
        </div>

        <div className="admin-side-foot">
          <div className="admin-user">
            <span>
              Signed in as
              <br />
              <strong style={{ color: "#fff" }}>{session.email}</strong>
            </span>
            <Link href="/" style={{ color: "#79D0F7" }}>
              View live site ↗
            </Link>
            <form action={logoutAction}>
              <button className="btn btn-sm btn-quiet" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
