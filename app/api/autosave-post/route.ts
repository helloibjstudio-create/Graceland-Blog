import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { estimateReadTime } from "@/lib/markdown";
import { slugify } from "@/lib/posts";
import { getPostById, postSlugExists, upsertPost } from "@/lib/store";
import type { Post, TagVariant } from "@/lib/types";

/**
 * Non-redirecting draft save used by the editor's autosave. Never publishes —
 * even if the form has status=published, this endpoint forces `draft`.
 */
export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const id = String(form.get("id") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "");
  const excerpt = String(form.get("excerpt") ?? "").trim();

  // Wait until there's a title — no point creating an empty stub.
  if (!title) return NextResponse.json({ skipped: "no-title" });

  const requestedSlug = slugify(String(form.get("slug") ?? "") || title);
  let slug = requestedSlug;
  // Avoid clobbering a real post's slug during autosave — append -draft if taken.
  if (await postSlugExists(slug, id || undefined)) {
    slug = `${requestedSlug}-draft-${Date.now().toString(36).slice(-4)}`;
  }

  const existing = id ? await getPostById(id) : undefined;
  const readTimeInput = Number(form.get("readTime"));

  const post: Post = {
    id: existing?.id ?? `post-${Date.now().toString(36)}`,
    slug,
    title,
    excerpt,
    body,
    topic: String(form.get("topic") ?? "wellness"),
    tag: String(form.get("tag") ?? "Mental Wellness").trim(),
    variant: (String(form.get("variant") ?? "blue") as TagVariant) || "blue",
    author: form.get("author") === "team" ? "team" : "popoola",
    date: String(form.get("date") ?? new Date().toISOString().slice(0, 10)),
    readTime:
      Number.isFinite(readTimeInput) && readTimeInput > 0
        ? Math.round(readTimeInput)
        : estimateReadTime(body || excerpt),
    image: String(form.get("image") ?? "").trim(),
    // Autosave *always* stores as draft, regardless of what the form currently says.
    status: existing?.status === "published" ? "published" : "draft",
    featured: existing?.featured ?? false,
    episodeUrl: String(form.get("episodeUrl") ?? "").trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  await upsertPost(post);
  return NextResponse.json({ ok: true, id: post.id, updatedAt: post.updatedAt });
}
