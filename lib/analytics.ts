import "server-only";
import { supabase } from "./supabase";
import type { Episode, Post } from "./types";

export type ItemMetric = {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  views: number;
  reads: number;
  shares: number;
  uniqueVisitors: number;
};

export type Overview = {
  hasData: boolean;
  totalViews: number;
  weekViews: number;
  weekPrev: number;
  weekChangePct: number;
  uniqueVisitorsWeek: number;
  publishedCount: number;
  draftCount: number;
  daily: { label: string; date: string; value: number }[]; // 14 days
  topPosts: ItemMetric[];
  topEpisodes: ItemMetric[];
  engagement: { label: string; value: number; color: string }[];
};

type Row = {
  kind: "post" | "episode";
  slug: string;
  event: "view" | "read" | "share";
  session_id: string | null;
  created_at: string;
};

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function buildOverview(posts: Post[], episodes: Episode[]): Promise<Overview> {
  const since = new Date(Date.now() - 21 * 86_400_000).toISOString(); // 3 weeks back
  const { data, error } = await supabase
    .from("pageviews")
    .select("kind,slug,event,session_id,created_at")
    .gte("created_at", since);

  const rows: Row[] = error ? [] : ((data ?? []) as Row[]);

  const publishedCount =
    posts.filter((p) => p.status === "published").length +
    episodes.filter((e) => e.status === "published").length;
  const draftCount =
    posts.filter((p) => p.status === "draft").length +
    episodes.filter((e) => e.status === "draft").length;

  if (rows.length === 0) {
    return {
      hasData: false,
      totalViews: 0,
      weekViews: 0,
      weekPrev: 0,
      weekChangePct: 0,
      uniqueVisitorsWeek: 0,
      publishedCount,
      draftCount,
      daily: emptyDaily(14),
      topPosts: [],
      topEpisodes: [],
      engagement: [
        { label: "Full reads", value: 0, color: "#2AA8E8" },
        { label: "Views", value: 0, color: "#8FD3F4" },
        { label: "Shares", value: 0, color: "#0D86CE" },
      ],
    };
  }

  const now = Date.now();
  const weekStart = now - 7 * 86_400_000;
  const prevStart = now - 14 * 86_400_000;

  // Aggregate per (kind:slug)
  const bySlug = new Map<string, { views: number; reads: number; shares: number; sessions: Set<string> }>();
  const daily = new Map<string, number>();
  let weekViews = 0;
  let weekPrev = 0;
  const weekSessions = new Set<string>();

  for (const r of rows) {
    const key = `${r.kind}:${r.slug}`;
    if (!bySlug.has(key)) {
      bySlug.set(key, { views: 0, reads: 0, shares: 0, sessions: new Set() });
    }
    const b = bySlug.get(key)!;
    const ts = Date.parse(r.created_at);
    if (r.event === "view") {
      b.views++;
      if (r.session_id) b.sessions.add(r.session_id);
      if (ts >= weekStart) {
        weekViews++;
        if (r.session_id) weekSessions.add(r.session_id);
        const dk = dayKey(r.created_at);
        daily.set(dk, (daily.get(dk) ?? 0) + 1);
      } else if (ts >= prevStart) {
        weekPrev++;
      }
    } else if (r.event === "read") {
      b.reads++;
    } else if (r.event === "share") {
      b.shares++;
    }
  }

  // 14 day daily series
  const dailySeries: Overview["daily"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const k = d.toISOString().slice(0, 10);
    dailySeries.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: k,
      value: daily.get(k) ?? 0,
    });
  }

  const metric = (item: Post | Episode, kind: "post" | "episode"): ItemMetric => {
    const b = bySlug.get(`${kind}:${item.slug}`);
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
      views: b?.views ?? 0,
      reads: b?.reads ?? 0,
      shares: b?.shares ?? 0,
      uniqueVisitors: b?.sessions.size ?? 0,
    };
  };

  const topPosts = posts
    .filter((p) => p.status === "published")
    .map((p) => metric(p, "post"))
    .filter((m) => m.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const topEpisodes = episodes
    .filter((e) => e.status === "published")
    .map((e) => metric(e, "episode"))
    .filter((m) => m.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const totalViews = Array.from(bySlug.values()).reduce((s, b) => s + b.views, 0);
  const totalReads = Array.from(bySlug.values()).reduce((s, b) => s + b.reads, 0);
  const totalShares = Array.from(bySlug.values()).reduce((s, b) => s + b.shares, 0);
  const skims = Math.max(0, totalViews - totalReads);

  const weekChangePct =
    weekPrev === 0 && weekViews === 0
      ? 0
      : weekPrev === 0
        ? 100
        : Math.round(((weekViews - weekPrev) / weekPrev) * 100);

  return {
    hasData: true,
    totalViews,
    weekViews,
    weekPrev,
    weekChangePct,
    uniqueVisitorsWeek: weekSessions.size,
    publishedCount,
    draftCount,
    daily: dailySeries,
    topPosts,
    topEpisodes,
    engagement: [
      { label: "Full reads", value: totalReads, color: "#2AA8E8" },
      { label: "Skims", value: skims, color: "#8FD3F4" },
      { label: "Shares", value: totalShares, color: "#0D86CE" },
    ],
  };
}

function emptyDaily(days: number): Overview["daily"] {
  const now = Date.now();
  const out: Overview["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: d.toISOString().slice(0, 10),
      value: 0,
    });
  }
  return out;
}
