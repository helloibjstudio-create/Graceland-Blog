"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Media from "./media";
import PostCard, { tagClass } from "./post-card";
import NewsletterForm from "./newsletter-form";
import { ArrowLeft, ArrowRight, ChevronDown, ClockIcon, ListIcon, MailIcon, PlayIcon, SearchIcon, UserIcon } from "./icons";
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

const PAGE_1_SIZE = 6;
const PAGE_N_SIZE = 12;

export default function BlogExplorer({ posts }: { posts: Post[] }) {
  const [filters, setFilters] = useState({ date: "all", topic: "all", author: "all" });
  const [openMenu, setOpenMenu] = useState<FilterKey | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const filtering = searching || Object.values(filters).some((v) => v !== "all");

  const visible = useMemo(() => {
    return posts.filter((post) => {
      if (filters.topic !== "all" && post.topic !== filters.topic) return false;
      if (filters.author !== "all" && post.author !== filters.author) return false;
      if (filters.date !== "all") {
        const days = Number(filters.date);
        const age = (NOW - Date.parse(`${post.date}T00:00:00Z`)) / 86_400_000;
        if (age > days) return false;
      }
      if (q) {
        const hay = `${post.title} ${post.excerpt} ${post.tag} ${post.topic}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, filters, q]);

  useEffect(() => {
    setPage(1);
  }, [filters, q]);

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);
  const sideCards = rest.slice(0, 2);
  // The featured post owns the top slot on page 1, so keep it out of the grid below.
  const pool = filtering ? visible : visible.filter((p) => p.id !== featured?.id);

  // Page 1 shows 6 cards; subsequent pages show 12.
  const totalPages = pool.length <= PAGE_1_SIZE
    ? 1
    : 1 + Math.ceil((pool.length - PAGE_1_SIZE) / PAGE_N_SIZE);
  const currentPage = Math.min(page, totalPages);
  const pageStart = currentPage === 1 ? 0 : PAGE_1_SIZE + (currentPage - 2) * PAGE_N_SIZE;
  const pageEnd = currentPage === 1 ? PAGE_1_SIZE : pageStart + PAGE_N_SIZE;
  const listed = pool.slice(pageStart, pageEnd);
  const firstRow = currentPage === 1 ? listed.slice(0, 3) : listed;
  const secondRow = currentPage === 1 ? listed.slice(3) : [];

  function set(key: FilterKey, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setOpenMenu(null);
  }

  const featuredAuthor = featured ? AUTHORS[featured.author] : null;

  return (
    <div>
      {/* ---------- Filters ---------- */}
      <div className="wrap">
        <div className="filters" ref={filtersRef}>
          <div className="filter-search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              aria-label="Search articles"
            />
          </div>
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
              onClick={() => {
                setFilters({ date: "all", topic: "all", author: "all" });
                setQuery("");
              }}
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
              {featured.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="feature-card-bg" src={featured.image} alt="" aria-hidden="true" />
              )}
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
            <span className="newsletter-badge">
              <MailIcon width={16} height={16} />
              Newsletter
            </span>
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
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              className="page-nav"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft /> Previous
            </button>
            <div className="pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
                n === currentPage ? (
                  <span key={n} className="is-current" aria-current="page">
                    {n}
                  </span>
                ) : (
                  <button key={n} type="button" onClick={() => setPage(n)}>
                    {n}
                  </button>
                )
              )}
            </div>
            <button
              className="page-nav"
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ArrowRight />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
