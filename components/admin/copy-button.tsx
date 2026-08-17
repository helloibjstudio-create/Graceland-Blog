"use client";

import { useState } from "react";

export default function CopyButton({ value, label = "Copy preview link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="btn btn-quiet btn-sm"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
