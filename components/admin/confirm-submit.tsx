"use client";

import type { ReactNode } from "react";

/** Submit button that asks first — used for destructive actions. */
export default function ConfirmSubmit({
  children,
  message,
  className = "btn btn-danger btn-sm",
}: {
  children: ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
