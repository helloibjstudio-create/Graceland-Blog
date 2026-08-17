import "server-only";
import { supabase } from "./supabase";
import type { Episode, Post } from "./types";

/* --------------------------------------------------------- row mappers --- */

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  topic: string;
  tag: string;
  variant: string;
  author: string;
  date: string;
  read_time: number;
  image: string;
  status: string;
  featured: boolean;
  episode_url: string | null;
  updated_at: string;
};

type EpisodeRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  variant: string;
  date: string;
  image: string;
  gradient: string;
  youtube_url: string;
  listen_url: string | null;
  note: string | null;
  article_href: string | null;
  status: string;
  updated_at: string;
};

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    topic: row.topic,
    tag: row.tag,
    variant: row.variant as Post["variant"],
    author: row.author as Post["author"],
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    status: row.status as Post["status"],
    featured: row.featured,
    episodeUrl: row.episode_url ?? undefined,
    updatedAt: row.updated_at,
  };
}

function postToRow(post: Post, updatedAt: string): PostRow {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    topic: post.topic,
    tag: post.tag,
    variant: post.variant,
    author: post.author,
    date: post.date,
    read_time: post.readTime,
    image: post.image,
    status: post.status,
    featured: post.featured ?? false,
    episode_url: post.episodeUrl ?? null,
    updated_at: updatedAt,
  };
}

function rowToEpisode(row: EpisodeRow): Episode {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    tag: row.tag,
    variant: row.variant as Episode["variant"],
    date: row.date,
    image: row.image,
    gradient: row.gradient,
    youtubeUrl: row.youtube_url,
    listenUrl: row.listen_url ?? undefined,
    note: row.note ?? undefined,
    articleHref: row.article_href ?? undefined,
    status: row.status as Episode["status"],
    updatedAt: row.updated_at,
  };
}

function episodeToRow(ep: Episode, updatedAt: string): EpisodeRow {
  return {
    id: ep.id,
    slug: ep.slug,
    title: ep.title,
    summary: ep.summary,
    tag: ep.tag,
    variant: ep.variant,
    date: ep.date,
    image: ep.image,
    gradient: ep.gradient,
    youtube_url: ep.youtubeUrl,
    listen_url: ep.listenUrl ?? null,
    note: ep.note ?? null,
    article_href: ep.articleHref ?? null,
    status: ep.status,
    updated_at: updatedAt,
  };
}

/* ---------------------------------------------------------------- posts --- */

export async function getPosts({ includeDrafts = false } = {}): Promise<Post[]> {
  let query = supabase.from("posts").select("*").order("date", { ascending: false });
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw new Error(`getPosts: ${error.message}`);
  return (data as PostRow[]).map(rowToPost);
}

export async function getPostBySlug(
  slug: string,
  { includeDrafts = false } = {},
): Promise<Post | undefined> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getPostBySlug: ${error.message}`);
  if (!data) return undefined;
  const post = rowToPost(data as PostRow);
  if (!includeDrafts && post.status !== "published") return undefined;
  return post;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getPostById: ${error.message}`);
  return data ? rowToPost(data as PostRow) : undefined;
}

export async function upsertPost(post: Post): Promise<Post> {
  const updatedAt = new Date().toISOString();
  const row = postToRow(post, updatedAt);
  const { data, error } = await supabase
    .from("posts")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw new Error(`upsertPost: ${error.message}`);
  return rowToPost(data as PostRow);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(`deletePost: ${error.message}`);
}

export async function postSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error(`postSlugExists: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function clearFeaturedPosts(excludeId: string): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .update({ featured: false, updated_at: new Date().toISOString() })
    .neq("id", excludeId)
    .eq("featured", true);
  if (error) throw new Error(`clearFeaturedPosts: ${error.message}`);
}

/** Returns the featured post (falls back to the newest published one). */
export function getFeaturedPost(posts: Post[]): Post | undefined {
  return posts.find((p) => p.featured) ?? posts[0];
}

/* ------------------------------------------------------------- episodes --- */

export async function getEpisodes({ includeDrafts = false } = {}): Promise<Episode[]> {
  let query = supabase.from("episodes").select("*").order("date", { ascending: false });
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw new Error(`getEpisodes: ${error.message}`);
  return (data as EpisodeRow[]).map(rowToEpisode);
}

export async function getEpisodeById(id: string): Promise<Episode | undefined> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getEpisodeById: ${error.message}`);
  return data ? rowToEpisode(data as EpisodeRow) : undefined;
}

export async function upsertEpisode(episode: Episode): Promise<Episode> {
  const updatedAt = new Date().toISOString();
  const row = episodeToRow(episode, updatedAt);
  const { data, error } = await supabase
    .from("episodes")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw new Error(`upsertEpisode: ${error.message}`);
  return rowToEpisode(data as EpisodeRow);
}

export async function deleteEpisode(id: string): Promise<void> {
  const { error } = await supabase.from("episodes").delete().eq("id", id);
  if (error) throw new Error(`deleteEpisode: ${error.message}`);
}

export async function episodeSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from("episodes")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { count, error } = await query;
  if (error) throw new Error(`episodeSlugExists: ${error.message}`);
  return (count ?? 0) > 0;
}
