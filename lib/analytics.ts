import "server-only";
import { supabase } from "./supabase";
import type { Episode, Post } from "./types";

export type RangeKey = "7d" | "30d" | "90d" | "1y";

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

export type SeriesPoint = { label: string; date: string; value: number };

export type Overview = {
  hasData: boolean;
  range: RangeKey;
  rangeLabel: string; // "last 7 days", "last 30 days", "last 3 months", "last year"
  totalViews: number; // views within the range
  rangeChangePct: number; // vs prior equal-length period
  uniqueVisitors: number; // unique session ids within the range
  publishedCount: number;
  draftCount: number;
  series: SeriesPoint[]; // daily / weekly / monthly depending on range
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

type Granularity = "day" | "week" | "month";

type RangeSpec = {
  key: RangeKey;
  label: string;
  days: number;
  granularity: Granularity;
};

const RANGES: Record<RangeKey, RangeSpec> = {
  "7d":  { key: "7d",  label: "last 7 days",   days: 7,   granularity: "day"   },
  "30d": { key: "30d", label: "last 30 days",  days: 30,  granularity: "day"   },
  "90d": { key: "90d", label: "last 3 months", days: 90,  granularity: "week"  },
  "1y":  { key: "1y",  label: "last year",     days: 365, granularity: "month" },
};

function bucketKey(iso: string, granularity: Granularity): string {
  const d = new Date(iso);
  if (granularity === "day") return d.toISOString().slice(0, 10);
  if (granularity === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  // week — key by the Monday of that ISO week (UTC)
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (monday.getUTCDay() + 6) % 7; // Mon=0
  monday.setUTCDate(monday.getUTCDate() - dow);
  return monday.toISOString().slice(0, 10);
}

function seriesShell(spec: RangeSpec): SeriesPoint[] {
  const now = new Date();
  const out: SeriesPoint[] = [];

  if (spec.granularity === "day") {
    for (let i = spec.days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86_400_000);
      const key = d.toISOString().slice(0, 10);
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: key,
        value: 0,
      });
    }
  } else if (spec.granularity === "week") {
    // 13 buckets ending this week (Monday-anchored, UTC)
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dow = (monday.getUTCDay() + 6) % 7;
    monday.setUTCDate(monday.getUTCDate() - dow);
    for (let i = 12; i >= 0; i--) {
      const start = new Date(monday.getTime() - i * 7 * 86_400_000);
      const key = start.toISOString().slice(0, 10);
      out.push({
        label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: key,
        value: 0,
      });
    }
  } else {
    // month — 12 monthly buckets ending this month
    const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        date: key,
        value: 0,
      });
    }
  }

  return out;
}

export function resolveRange(input: string | string[] | undefined): RangeKey {
  const v = Array.isArray(input) ? input[0] : input;
  return v && v in RANGES ? (v as RangeKey) : "7d";
}

export async function buildOverview(
  posts: Post[],
  episodes: Episode[],
  range: RangeKey = "7d",
): Promise<Overview> {
  const spec = RANGES[range];
  const rangeMs = spec.days * 86_400_000;
  const now = Date.now();
  const sinceIso = new Date(now - 2 * rangeMs).toISOString(); // pull 2× so we can compare vs prior period

  const { data, error } = await supabase
    .from("pageviews")
    .select("kind,slug,event,session_id,created_at")
    .gte("created_at", sinceIso);

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
      range,
      rangeLabel: spec.label,
      totalViews: 0,
      rangeChangePct: 0,
      uniqueVisitors: 0,
      publishedCount,
      draftCount,
      series: seriesShell(spec),
      topPosts: [],
      topEpisodes: [],
      engagement: [
        { label: "Full reads", value: 0, color: "#2AA8E8" },
        { label: "Views", value: 0, color: "#8FD3F4" },
        { label: "Shares", value: 0, color: "#0D86CE" },
      ],
    };
  }

  const rangeStart = now - rangeMs;
  const prevStart = now - 2 * rangeMs;

  // Per (kind:slug) aggregates within the current range.
  const bySlug = new Map<string, { views: number; reads: number; shares: number; sessions: Set<string> }>();
  const bucketed = new Map<string, number>();
  let rangeViews = 0;
  let rangePrev = 0;
  const rangeSessions = new Set<string>();

  for (const r of rows) {
    const ts = Date.parse(r.created_at);
    if (r.event === "view") {
      if (ts >= rangeStart) {
        rangeViews++;
        if (r.session_id) rangeSessions.add(r.session_id);
        const key = bucketKey(r.created_at, spec.granularity);
        bucketed.set(key, (bucketed.get(key) ?? 0) + 1);
      } else if (ts >= prevStart) {
        rangePrev++;
      }
    }
    if (ts < rangeStart) continue;
    const k = `${r.kind}:${r.slug}`;
    if (!bySlug.has(k)) bySlug.set(k, { views: 0, reads: 0, shares: 0, sessions: new Set() });
    const b = bySlug.get(k)!;
    if (r.event === "view") {
      b.views++;
      if (r.session_id) b.sessions.add(r.session_id);
    } else if (r.event === "read") {
      b.reads++;
    } else if (r.event === "share") {
      b.shares++;
    }
  }

  const series = seriesShell(spec).map((p) => ({ ...p, value: bucketed.get(p.date) ?? p.value }));

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

  const totalReads = Array.from(bySlug.values()).reduce((s, b) => s + b.reads, 0);
  const totalShares = Array.from(bySlug.values()).reduce((s, b) => s + b.shares, 0);
  const skims = Math.max(0, rangeViews - totalReads);

  const rangeChangePct =
    rangePrev === 0 && rangeViews === 0
      ? 0
      : rangePrev === 0
        ? 100
        : Math.round(((rangeViews - rangePrev) / rangePrev) * 100);

  return {
    hasData: true,
    range,
    rangeLabel: spec.label,
    totalViews: rangeViews,
    rangeChangePct,
    uniqueVisitors: rangeSessions.size,
    publishedCount,
    draftCount,
    series,
    topPosts,
    topEpisodes,
    engagement: [
      { label: "Full reads", value: totalReads, color: "#2AA8E8" },
      { label: "Skims", value: skims, color: "#8FD3F4" },
      { label: "Shares", value: totalShares, color: "#0D86CE" },
    ],
  };
}
