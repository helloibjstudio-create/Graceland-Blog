import Link from "next/link";
import {
  deleteEpisodeAction,
  deletePostAction,
  toggleEpisodeStatusAction,
  togglePostStatusAction,
} from "@/app/admin/actions";
import { previewPath } from "@/lib/auth";
import type { PostStatus } from "@/lib/types";
import ConfirmSubmit from "./confirm-submit";

type Props = {
  kind: "post" | "episode";
  id: string;
  slug?: string;
  status: PostStatus;
};

export default function RowActions({ kind, id, slug, status }: Props) {
  const isPost = kind === "post";
  const toggle = isPost ? togglePostStatusAction : toggleEpisodeStatusAction;
  const remove = isPost ? deletePostAction : deleteEpisodeAction;

  return (
    <div className="row-actions">
      {isPost && slug && (
        <Link
          className="btn btn-quiet btn-sm"
          href={status === "published" ? `/blog/${slug}` : previewPath(slug)}
          target="_blank"
        >
          {status === "published" ? "View" : "Preview"}
        </Link>
      )}

      <form action={toggle}>
        <input type="hidden" name="id" value={id} />
        <button className="btn btn-quiet btn-sm" type="submit">
          {status === "published" ? "Unpublish" : "Publish"}
        </button>
      </form>

      <form action={remove}>
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmit
          className="btn btn-danger btn-sm"
          message={`Delete this ${kind}? This cannot be undone.`}
        >
          Delete
        </ConfirmSubmit>
      </form>
    </div>
  );
}
