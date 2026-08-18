"use client";

import { useEffect } from "react";

type Kind = "post" | "episode";
type Props = { kind: Kind; slug: string };

/**
 * Fires one "view" beacon on mount and a "read" beacon once the reader has spent
 * 30s on the page AND scrolled past 60% — that's what shows up in the admin
 * performance dashboard.
 */
export default function ViewTracker({ kind, slug }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!slug) return;

    // A stable per-browser id so we can count unique readers cheaply.
    let sessionId = "";
    try {
      sessionId = localStorage.getItem("gp_sid") ?? "";
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("gp_sid", sessionId);
      }
    } catch {
      // localStorage blocked — fine, view still counts, just not deduped.
    }

    const send = (event: "view" | "read") =>
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          slug,
          event,
          sessionId,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      }).catch(() => {});

    // Fire the view immediately.
    send("view");

    // Track a "read" once the reader has stayed 30s AND scrolled ≥ 60%.
    let dwellHit = false;
    let scrollHit = false;
    let fired = false;
    const maybeFire = () => {
      if (fired || !dwellHit || !scrollHit) return;
      fired = true;
      send("read");
    };
    const timer = window.setTimeout(() => {
      dwellHit = true;
      maybeFire();
    }, 30_000);
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop + window.innerHeight) / (h.scrollHeight || 1);
      if (pct >= 0.6) {
        scrollHit = true;
        maybeFire();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [kind, slug]);

  return null;
}
