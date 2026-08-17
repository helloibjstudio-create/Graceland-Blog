import type { PostStatus } from "@/lib/types";

export default function StatusPill({ status }: { status: PostStatus }) {
  return (
    <span className={`status status-${status}`}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}
