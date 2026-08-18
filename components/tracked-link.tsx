"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  kind: "post" | "episode";
  slug: string;
  event?: "view" | "read" | "share";
  children: ReactNode;
};

/** Anchor that fires a `keepalive` beacon just before navigation. */
export default function TrackedLink({ kind, slug, event = "view", onClick, children, ...rest }: Props) {
  const handler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    let sessionId = "";
    try {
      sessionId = localStorage.getItem("gp_sid") ?? "";
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("gp_sid", sessionId);
      }
    } catch {}
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, slug, event, sessionId, referrer: document.referrer || undefined }),
      keepalive: true,
    }).catch(() => {});
    onClick?.(e);
  };
  return (
    <a {...rest} onClick={handler}>
      {children}
    </a>
  );
}
