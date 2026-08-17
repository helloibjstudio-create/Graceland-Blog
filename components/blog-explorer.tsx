"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Media from "./media";
import PostCard, { tagClass } from "./post-card";
import NewsletterForm from "./newsletter-form";
import { ArrowLeft, ArrowRight, ChevronDown, ClockIcon, ListIcon, PlayIcon, UserIcon } from "./icons";
import { DISCUSSION_TOPICS } from "@/lib/site";
import {
  AUTHORS,
  AUTHOR_FILTERS,
  DATE_FILTERS,
  TOPIC_FILTERS,
  formatDate,
  type Post,
} from "@/lib/posts";

type FilterKey = "date" | "topic" | "author";

type Option = { value: string; label: string };

const NOW = Date.parse("2026-08-17T00:00:00Z"); // "today" for the demo dataset

function FilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
  open,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const current = options.find((o) => o.value === value);
  const isDefault = value === "all";

  return (
    <div className={`filter${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="filter-btn"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {icon}
        <span className="filter-value">{isDefault ? label : current?.label}</span>
        <ChevronDown width={10} height={6} />
      </button>
      <div className="filter-menu" role="group" aria-label={`Filter by ${label}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BlogExplorer({ posts }: { posts: Post[] }) {
  const [filters, setFilters] = useState({ date: "all", topic: "all", author: "all" });
  const [openMenu, setOpenMenu] = useState<FilterKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const filtering = Object.values(filters).some((v) => v !== "all");

  const visible = useMemo(() => {
    return posts.filter((post) => {
      if (filters.topic !== "all" && post.topic !== filters.topic) return false;
      if (filters.author !== "all" && post.author !== filters.author) return false;
      if (filters.date !== "all") {
        const days = Number(filters.date);
        const age = (NOW - Date.parse(`${post.date}T00:00:00Z`)) / 86_400_000;
        if (age > days) return false;
      }
      return true;
    });
  }, [posts, filters]);

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);
  const sideCards = rest.slice(0, 2);
  // The featured post owns the top slot, so keep it out of the grid below.
  const listed = filtering ? visible : visible.filter((p) => p.id !== featured?.id);
  const firstRow = listed.slice(0, 3);
  const secondRow = listed.slice(3);

  function set(key: FilterKey, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setOpenMenu(null);
  }

  const featuredAuthor = featured ? AUTHORS[featured.author] : null;

  return (
    <div ref={rootRef}>
      {/* ---------- Filters ---------- */}
      <div className="wrap">
        <div className="filters">
          <FilterDropdown
            label="Posted at"
            icon={<ClockIcon />}
            options={DATE_FILTERS}
            value={filters.date}
            open={openMenu === "date"}
            onToggle={() => setOpenMenu(openMenu === "date" ? null : "date")}
            onChange={(v) => set("date", v)}
          />
          <FilterDropdown
            label="Content type"
            icon={<ListIcon />}
            options={TOPIC_FILTERS}
            value={filters.topic}
            open={openMenu === "topic"}
            onToggle={() => setOpenMenu(openMenu === "topic" ? null : "topic")}
            onChange={(v) => set("topic", v)}
          />
          <FilterDropdown
            label="Author"
            icon={<UserIcon />}
            options={AUTHOR_FILTERS}
            value={filters.author}
            open={openMenu === "author"}
            onToggle={() => setOpenMenu(openMenu === "author" ? null : "author")}
            onChange={(v) => set("author", v)}
          />
          {filtering && (
            <button
              type="button"
              className="filter-btn"
              onClick={() => setFilters({ date: "all", topic: "all", author: "all" })}
            >
              Clear filters ✕
            </button>
          )}
        </div>
      </div>

      {/* ---------- Featured ---------- */}
      {!filtering && featured && featuredAuthor && (
        <section className="wrap">
          <div className="feature-row">
            <article className="feature-card">
              <div className="feature-pills">
                <span className="tag tag-new">NEW</span>
                <span className="tag tag-glass">{featured.tag}</span>
              </div>
              <h2>
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.excerpt}</p>
              <div className="feature-foot">
                <div className="byline">
                  <span className="avatar">{featuredAuthor.initials}</span>
                  <span>
                    <span className="byline-name">{featuredAuthor.name}</span>
                    <span className="byline-meta">
                      {formatDate(featured.date)} · {featured.readTime} min
                    </span>
                  </span>
                </div>
                <div className="feature-actions">
                  {featured.episodeUrl && (
                    <Link className="btn btn-primary btn-sm" href={featured.episodeUrl}>
                      <PlayIcon />
                      Listen to the Episode
                    </Link>
                  )}
                  <Link className="link-arrow" href={`/blog/${featured.slug}`}>
                    Read Article <ArrowRight />
                  </Link>
                </div>
              </div>
            </article>

            <div className="feature-side">
              {sideCards.map((post) => (
                <Link className="mini-card" href={`/blog/${post.slug}`} key={post.slug}>
                  <Media src={post.image} />
                  <div className="mini-body">
                    <span className={tagClass(post.variant)}>{post.tag}</span>
                    <h3>{post.title}</h3>
                    <div className="meta">
                      <span>{post.readTime} min</span>
                      <span>·</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Latest articles ---------- */}
      <section className="wrap section">
        <div className="section-title" style={{ marginBottom: 26 }}>
          <h2>{filtering ? "Results" : "Latest Articles"}</h2>
          <span className="count-pill">
            {visible.length} {visible.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {listed.length === 0 && (
          <p style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
            No articles match those filters yet — try widening your selection.
          </p>
        )}

        {firstRow.length > 0 && (
          <div className="card-grid">
            {firstRow.map((post) => (
              <PostCard post={post} key={post.slug} />
            ))}
          </div>
        )}

        <div className="newsletter">
          <div>
            <span className="tag">✉ Newsletter</span>
            <h3>Stay ahead in mental health.</h3>
            <p>
              New articles, research updates, and clinical insights delivered to your inbox — no
              spam, unsubscribe anytime.
            </p>
          </div>
          <NewsletterForm id="nl-blog" />
        </div>

        {secondRow.length > 0 && (
          <div className="card-grid">
            {secondRow.map((post) => (
              <PostCard post={post} key={post.slug} />
            ))}
          </div>
        )}

        {/* ---------- We Discuss ---------- */}
        <div className="section-tight">
          <h2 style={{ fontSize: "1.35rem" }}>We Discuss</h2>
          <div className="topics">
            {DISCUSSION_TOPICS.map((topic) => (
              <button className="topic" type="button" key={topic}>
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Pagination ---------- */}
        <nav className="pagination" aria-label="Pagination">
          <button className="page-nav" type="button" disabled>
            <ArrowLeft /> Previous
          </button>
          <div className="pages">
            <span className="is-current" aria-current="page">
              1
            </span>
            <Link href="/blog?page=2">2</Link>
            <Link href="/blog?page=3">3</Link>
            <span>…</span>
            <Link href="/blog?page=8">8</Link>
            <Link href="/blog?page=9">9</Link>
            <Link href="/blog?page=10">10</Link>
          </div>
          <Link className="page-nav" href="/blog?page=2">
            Next <ArrowRight />
          </Link>
        </nav>
      </section>
    </div>
  );
}
