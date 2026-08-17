"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/** Sidebar contents list with scroll-spy highlighting. */
export default function ArticleAside({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.length) return;

    const onScroll = () => {
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 160) current = item.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <aside className="toc">
      <p className="toc-title">Contents</p>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={active === item.id ? "is-active" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="toc-cta">
        <span className="eyebrow">TMS at Graceland</span>
        <p>Find out if TMS is right for you — with a free consultation.</p>
        <Link className="btn btn-primary btn-sm btn-block" href="/contact">
          Book Now
        </Link>
      </div>
    </aside>
  );
}
