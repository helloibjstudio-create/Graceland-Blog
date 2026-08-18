"use client";

import { useEffect, useState } from "react";

type Props = {
  show: boolean;
  label?: string;
};

export default function PostedToast({ show, label = "Posted!" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className={`posted-toast${visible ? " is-visible" : " is-leaving"}`} role="status" aria-live="polite">
      <span className="posted-toast-check" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
          <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" className="posted-toast-ring" />
          <path
            d="M9 16.5l5 5 9-11"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="posted-toast-tick"
          />
        </svg>
      </span>
      <span className="posted-toast-label">{label}</span>
    </div>
  );
}
