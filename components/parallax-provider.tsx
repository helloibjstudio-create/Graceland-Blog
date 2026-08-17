"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Drives every `[data-parallax]` element on the page from a single rAF loop.
 * The attribute value is the speed factor: 0.2 = drifts at 20% of scroll.
 * Honours prefers-reduced-motion and re-scans on route change.
 */
export default function ParallaxProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let nodes: { el: HTMLElement; speed: number; scale: boolean }[] = [];

    const collect = () => {
      nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
        el,
        speed: parseFloat(el.dataset.parallax || "0.2"),
        scale: el.dataset.parallaxScale === "true",
      }));
    };

    const render = () => {
      frame = 0;
      const viewport = window.innerHeight;

      for (const { el, speed, scale } of nodes) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewport + 200) continue;

        // -1 (below the fold) … 0 (centred) … 1 (above the fold)
        const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
        const shift = progress * speed * 100;
        el.style.transform = scale
          ? `translate3d(0, ${shift}px, 0) scale(${1 + Math.abs(progress) * 0.06})`
          : `translate3d(0, ${shift}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    collect();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Elements can mount after hydration (filters, client lists).
    const observer = new MutationObserver(() => {
      collect();
      onScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
