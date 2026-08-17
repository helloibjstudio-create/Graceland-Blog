"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/posts", label: "Blog posts", countKey: "posts" as const },
  { href: "/admin/episodes", label: "Podcast episodes", countKey: "episodes" as const },
];

export default function AdminNav({
  postCount,
  episodeCount,
}: {
  postCount: number;
  episodeCount: number;
}) {
  const pathname = usePathname();
  const counts = { posts: postCount, episodes: episodeCount };

  return (
    <ul className="admin-nav">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={active ? "page" : undefined}>
              {item.label}
              {item.countKey && <span className="pill">{counts[item.countKey]}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
