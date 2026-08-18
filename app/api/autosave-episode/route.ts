import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/posts";
import { episodeSlugExists, getEpisodeById, upsertEpisode } from "@/lib/store";
import type { Episode, TagVariant } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const id = String(form.get("id") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ skipped: "no-title" });

  const requestedSlug = slugify(String(form.get("slug") ?? "") || title);
  let slug = requestedSlug;
  if (await episodeSlugExists(slug, id || undefined)) {
    slug = `${requestedSlug}-draft-${Date.now().toString(36).slice(-4)}`;
  }

  const existing = id ? await getEpisodeById(id) : undefined;

  const episode: Episode = {
    id: existing?.id ?? `ep-${Date.now().toString(36)}`,
    slug,
    title,
    summary: String(form.get("summary") ?? "").trim(),
    tag: String(form.get("tag") ?? "Mental Health 101").trim(),
    variant: (String(form.get("variant") ?? "blue") as TagVariant) || "blue",
    date: String(form.get("date") ?? new Date().toISOString().slice(0, 10)),
    image: String(form.get("image") ?? "").trim(),
    gradient:
      String(form.get("gradient") ?? "").trim() || "linear-gradient(150deg,#123B52,#1D6E96)",
    youtubeUrl: String(form.get("youtubeUrl") ?? "").trim(),
    listenUrl: String(form.get("listenUrl") ?? "").trim() || undefined,
    note: String(form.get("note") ?? "").trim() || undefined,
    articleHref: String(form.get("articleHref") ?? "").trim() || undefined,
    status: existing?.status === "published" ? "published" : "draft",
    updatedAt: new Date().toISOString(),
  };

  await upsertEpisode(episode);
  return NextResponse.json({ ok: true, id: episode.id, updatedAt: episode.updatedAt });
}
