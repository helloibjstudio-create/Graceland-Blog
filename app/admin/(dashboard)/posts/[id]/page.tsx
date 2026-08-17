import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/post-editor";
import { ARTICLE_BODIES } from "@/content";
import { previewPath } from "@/lib/auth";
import { getPostById } from "@/lib/store";

export default async function PostEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  if (id === "new") {
    return <PostEditor previewUrl={null} />;
  }

  const post = await getPostById(id);
  if (!post) notFound();

  const head = await headers();
  const host = head.get("host") ?? "localhost:3000";
  const proto = head.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const previewUrl = `${proto}://${host}${previewPath(post.slug)}`;

  return (
    <PostEditor
      post={post}
      previewUrl={previewUrl}
      saved={Boolean(saved)}
      hasCodedBody={Boolean(ARTICLE_BODIES[post.slug])}
    />
  );
}
