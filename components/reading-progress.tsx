"use client";

import { useEffect, useState } from "react";

/** Thin progress bar tracking how far the reader is through `.prose`. */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const prose = document.querySelector<HTMLElement>(".prose");
      if (!prose) return;
      const span = prose.offsetHeight - window.innerHeight;
      const progress = span > 0 ? ((window.scrollY - prose.offsetTop) / span) * 100 : 0;
      setPct(Math.min(100, Math.max(0, progress)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div className="progress-bar" style={{ width: `${pct}%` }} aria-hidden="true" />;
}
