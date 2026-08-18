"use server";

import { revalidatePath } from "next/cache";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, endSession, requireSession, startSession } from "@/lib/auth";
import { estimateReadTime } from "@/lib/markdown";
import { slugify } from "@/lib/posts";
import {
  clearFeaturedPosts,
  deleteEpisode,
  deletePost,
  episodeSlugExists,
  getEpisodeById,
  getPostById,
  postSlugExists,
  upsertEpisode,
  upsertPost,
} from "@/lib/store";
import type { Episode, Post, PostStatus, TagVariant } from "@/lib/types";

export type ActionState = { error?: string; ok?: string };

/* ----------------------------------------------------------------- auth --- */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  try {
    if (!checkCredentials(email, password)) {
      return { error: "Those credentials do not match an admin account." };
    }
  } catch (err) {
    return { error: (err as Error).message };
  }

  await startSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

/* ---------------------------------------------------------------- posts --- */

function revalidateBlog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function savePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim();

  if (!title) return { error: "A title is required." };
  if (!excerpt) return { error: "An excerpt is required — it is used on cards and in search results." };

  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (await postSlugExists(slug, id || undefined)) {
    return { error: `The slug "${slug}" is already used by another post.` };
  }

  const readTimeInput = Number(formData.get("readTime"));
  const existing = id ? await getPostById(id) : undefined;

  const post: Post = {
    id: existing?.id ?? `post-${Date.now().toString(36)}`,
    slug,
    title,
    excerpt,
    body,
    topic: String(formData.get("topic") ?? "wellness"),
    tag: String(formData.get("tag") ?? "Mental Wellness").trim(),
    variant: (String(formData.get("variant") ?? "blue") as TagVariant) || "blue",
    author: formData.get("author") === "team" ? "team" : "popoola",
    date: String(formData.get("date") ?? new Date().toISOString().slice(0, 10)),
    readTime:
      Number.isFinite(readTimeInput) && readTimeInput > 0
        ? Math.round(readTimeInput)
        : estimateReadTime(body || excerpt),
    image: String(formData.get("image") ?? "").trim(),
    status: (String(formData.get("status") ?? "draft") as PostStatus) === "published"
      ? "published"
      : "draft",
    featured: formData.get("featured") === "on",
    episodeUrl: String(formData.get("episodeUrl") ?? "").trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  if (post.featured) await clearFeaturedPosts(post.id);
  await upsertPost(post);

  if (post.status === "draft") (await draftMode()).disable();
  revalidateBlog(post.slug);
  if (existing && existing.slug !== post.slug) revalidatePath(`/blog/${existing.slug}`);

  redirect(`/admin/posts/${post.id}?saved=1`);
}

export async function togglePostStatusAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const post = await getPostById(id);
  if (!post) return;
  const next: Post = {
    ...post,
    status: post.status === "published" ? "draft" : "published",
  };
  await upsertPost(next);
  // If we just unpublished, drop the preview cookie so the admin sees the
  // reader's view immediately — otherwise the draft would keep appearing.
  if (next.status === "draft") (await draftMode()).disable();
  revalidateBlog(post.slug);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const post = await getPostById(id);
  await deletePost(id);
  revalidateBlog(post?.slug);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

/* ------------------------------------------------------------- episodes --- */

export async function saveEpisodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "A title is required." };

  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (await episodeSlugExists(slug, id || undefined)) {
    return { error: `The slug "${slug}" is already used by another episode.` };
  }

  const existing = id ? await getEpisodeById(id) : undefined;

  const episode: Episode = {
    id: existing?.id ?? `ep-${Date.now().toString(36)}`,
    slug,
    title,
    summary: String(formData.get("summary") ?? "").trim(),
    tag: String(formData.get("tag") ?? "Mental Health 101").trim(),
    variant: (String(formData.get("variant") ?? "blue") as TagVariant) || "blue",
    date: String(formData.get("date") ?? new Date().toISOString().slice(0, 10)),
    image: String(formData.get("image") ?? "").trim(),
    gradient:
      String(formData.get("gradient") ?? "").trim() || "linear-gradient(150deg,#123B52,#1D6E96)",
    youtubeUrl: String(formData.get("youtubeUrl") ?? "").trim(),
    listenUrl: String(formData.get("listenUrl") ?? "").trim() || undefined,
    note: String(formData.get("note") ?? "").trim() || undefined,
    articleHref: String(formData.get("articleHref") ?? "").trim() || undefined,
    status: (String(formData.get("status") ?? "draft") as PostStatus) === "published"
      ? "published"
      : "draft",
    updatedAt: new Date().toISOString(),
  };

  await upsertEpisode(episode);
  if (episode.status === "draft") (await draftMode()).disable();
  revalidatePath("/podcast");
  redirect(`/admin/episodes/${episode.id}?saved=1`);
}

export async function toggleEpisodeStatusAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const episode = await getEpisodeById(id);
  if (!episode) return;
  const nextStatus = episode.status === "published" ? "draft" : "published";
  await upsertEpisode({
    ...episode,
    status: nextStatus,
  });
  if (nextStatus === "draft") (await draftMode()).disable();
  revalidatePath("/podcast");
  revalidatePath("/admin/episodes");
  revalidatePath("/admin");
}

export async function deleteEpisodeAction(formData: FormData) {
  await requireSession();
  await deleteEpisode(String(formData.get("id") ?? ""));
  revalidatePath("/podcast");
  revalidatePath("/admin");
  redirect("/admin/episodes?deleted=1");
}

/* ------------------------------------------------------------------- AI --- */

type PostSuggestion = { topic: string; tag: string; variant: string; excerpt: string };
type EpisodeSuggestion = { tag: string; variant: string };

export async function suggestPostMetadata(
  title: string,
  bodyText: string,
): Promise<PostSuggestion | { error: string }> {
  await requireSession();
  if (!process.env.ANTHROPIC_API_KEY) return { error: "ANTHROPIC_API_KEY is not configured." };
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      system:
        "You are a metadata assistant for a psychiatry practice blog. Return ONLY valid JSON with no markdown fencing or extra text.",
      messages: [
        {
          role: "user",
          content: `Analyze this blog post and return metadata.

Title: ${title}
Content: ${bodyText.slice(0, 2000)}

Return JSON:
- "topic": one of: tms, depression, anxiety, child, wellness, spravato, adhd
- "tag": short display label (e.g. "TMS Therapy", "Mental Wellness", "Anxiety", "ADHD", "Child Psychiatry")
- "variant": one of: blue, green, violet, amber, rose
- "excerpt": compelling 1-2 sentence summary under 160 characters`,
        },
      ],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    return JSON.parse(text) as PostSuggestion;
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function suggestEpisodeMetadata(
  title: string,
  summary: string,
): Promise<EpisodeSuggestion | { error: string }> {
  await requireSession();
  if (!process.env.ANTHROPIC_API_KEY) return { error: "ANTHROPIC_API_KEY is not configured." };
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 128,
      system: "Return ONLY valid JSON with no markdown fencing.",
      messages: [
        {
          role: "user",
          content: `Analyze this podcast episode for a psychiatry practice.

Title: ${title}
Summary: ${summary}

Return JSON:
- "tag": short label like "Mental Health 101", "Patient Story", "TMS Therapy", "Depression", "Anxiety", "ADHD"
- "variant": one of: blue, green, violet, amber, rose`,
        },
      ],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    return JSON.parse(text) as EpisodeSuggestion;
  } catch (err) {
    return { error: (err as Error).message };
  }
}
