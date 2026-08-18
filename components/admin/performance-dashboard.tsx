"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ItemMetric, Overview } from "@/lib/analytics";

/** Counts up to `target` over ~900ms — makes the top numbers feel alive. */
function useCountUp(target: number, start = 0, ms = 900) {
  const [n, setN] = useState(start);
  useEffect(() => {
    if (target === 0) {
      setN(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, ms]);
  return n;
}

function fmt(n: number) {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

function AreaChart({ points }: { points: { label: string; value: number }[] }) {
  const w = 720, h = 220, pad = { l: 34, r: 12, t: 14, b: 28 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = iw / (points.length - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const area = `${path} L ${x(points.length - 1)} ${pad.t + ih} L ${x(0)} ${pad.t + ih} Z`;

  const [hover, setHover] = useState<number | null>(null);
  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="perf-chart" role="img" aria-label="Views over the last 14 days">
      <defs>
        <linearGradient id="perf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2AA8E8" stopOpacity=".38" />
          <stop offset="100%" stopColor="#2AA8E8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const val = Math.round((max * (yTicks - i)) / yTicks);
        const yy = pad.t + (ih * i) / yTicks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={yy} y2={yy} stroke="#EDF2F7" />
            <text x={pad.l - 6} y={yy + 3} textAnchor="end" fontSize="10" fill="#8899A6">
              {fmt(val)}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#perf-area)" className="perf-area" />
      <path d={path} fill="none" stroke="#2AA8E8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="perf-line" />

      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <rect x={x(i) - step / 2} y={pad.t} width={step} height={ih} fill="transparent" />
          <circle cx={x(i)} cy={y(p.value)} r={hover === i ? 5 : 0} fill="#fff" stroke="#2AA8E8" strokeWidth="2.5" />
          {i % 2 === 0 && (
            <text x={x(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="#8899A6">
              {p.label}
            </text>
          )}
        </g>
      ))}

      {hover !== null && (
        <g pointerEvents="none">
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#2AA8E8" strokeDasharray="3 3" />
          <g transform={`translate(${x(hover)}, ${y(points[hover].value) - 14})`}>
            <rect x={-38} y={-22} width={76} height={22} rx="6" fill="#0A1628" />
            <text x={0} y={-7} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
              {fmt(points[hover].value)} views
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 62, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="perf-donut">
      <svg viewBox="0 0 180 180" role="img" aria-label="Engagement mix">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDF2F7" strokeWidth="20" />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="perf-donut-seg"
              style={{ ["--dash" as string]: `${dash}` }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0A1628">
          {fmt(total)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="#8899A6" letterSpacing="1">
          INTERACTIONS
        </text>
      </svg>
      <ul>
        {segments.map((s) => (
          <li key={s.label}>
            <span className="perf-donut-swatch" style={{ background: s.color }} />
            <span>{s.label}</span>
            <b>{fmt(s.value)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopList({ title, items, base }: { title: string; items: ItemMetric[]; base: string }) {
  const max = Math.max(...items.map((i) => i.views), 1);
  return (
    <div className="perf-toplist">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="perf-empty">Publish something and it&rsquo;ll show up here.</p>
      ) : (
        <ol>
          {items.map((m, i) => (
            <li key={m.id}>
              <div className="perf-rank">{i + 1}</div>
              <div className="perf-item">
                <Link href={`${base}/${m.id}`}>{m.title}</Link>
                <div className="perf-bar">
                  <span style={{ width: `${(m.views / max) * 100}%` }} />
                </div>
                <div className="perf-item-meta">
                  <span>{fmt(m.views)} views</span>
                  <span>{fmt(m.reads)} reads</span>
                  <span>{fmt(m.shares)} shares</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function PerformanceDashboard({ data }: { data: Overview }) {
  const router = useRouter();
  const total = useCountUp(data.totalViews);
  const week = useCountUp(data.weekViews);
  const [range, setRange] = useState<"7d" | "14d">("14d");

  // Poll the server every 30s so views refresh without a manual reload.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30_000);
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);
  const points = useMemo(
    () => (range === "7d" ? data.daily.slice(-7) : data.daily),
    [data.daily, range],
  );
  const up = data.weekChangePct >= 0;

  return (
    <div className="perf-wrap">
      <div className="perf-head">
        <div>
          <span className="perf-eyebrow">Performance snapshot</span>
          <h2>How your content is doing</h2>
        </div>
        <div className="perf-range">
          <button
            type="button"
            className={range === "7d" ? "is-active" : ""}
            onClick={() => setRange("7d")}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className={range === "14d" ? "is-active" : ""}
            onClick={() => setRange("14d")}
          >
            Last 14 days
          </button>
        </div>
      </div>

      <div className="perf-stats">
        <div className="perf-stat perf-stat--hero">
          <span>Total views</span>
          <b>{fmt(total)}</b>
          <div className={`perf-delta ${up ? "up" : "down"}`}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d={up ? "M5 1l4 5H1z" : "M5 9L1 4h8z"} fill="currentColor" />
            </svg>
            {up ? "+" : ""}
            {data.weekChangePct}% vs prior week
          </div>
        </div>
        <div className="perf-stat">
          <span>This week</span>
          <b>{fmt(week)}</b>
          <small>views across all content</small>
        </div>
        <div className="perf-stat">
          <span>Unique visitors</span>
          <b>{fmt(data.uniqueVisitorsWeek)}</b>
          <small>last 7 days</small>
        </div>
        <div className="perf-stat">
          <span>Published</span>
          <b>{data.publishedCount}</b>
          <small>posts + episodes live</small>
        </div>
        <div className="perf-stat">
          <span>Drafts</span>
          <b>{data.draftCount}</b>
          <small>waiting to ship</small>
        </div>
      </div>

      <div className="perf-grid">
        <div className="perf-panel perf-panel--wide">
          <div className="perf-panel-head">
            <h3>Traffic</h3>
            <span className="perf-hint">Hover any point for exact views</span>
          </div>
          <AreaChart points={points} />
        </div>

        <div className="perf-panel">
          <div className="perf-panel-head">
            <h3>Engagement mix</h3>
          </div>
          <Donut segments={data.engagement} />
        </div>

        <div className="perf-panel">
          <TopList title="Top blog posts" items={data.topPosts} base="/admin/posts" />
        </div>
        <div className="perf-panel">
          <TopList title="Top episodes" items={data.topEpisodes} base="/admin/episodes" />
        </div>
      </div>

      {!data.hasData && (
        <div className="perf-empty-banner">
          <b>Waiting for traffic.</b> Numbers refresh in real time — as soon as a reader lands on
          a published post or clicks a podcast episode, it&rsquo;ll show up here. Nothing here yet.
        </div>
      )}
    </div>
  );
}
