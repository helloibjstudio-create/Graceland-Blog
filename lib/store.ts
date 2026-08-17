import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_POSTS } from "./posts";
import { SEED_EPISODES } from "./episodes";
import type { ContentStore, Episode, Post } from "./types";

/**
 * File-backed content store.
 *
 * Everything the CMS edits lives in one JSON document on disk. That keeps the
 * project dependency-free and easy to run anywhere with a writable filesystem
 * (a VPS, a container with a volume, `next start` on a droplet). If you deploy
 * to a read-only/serverless target, swap the two functions below — `readStore`
 * and `writeStore` — for your database of choice; nothing else changes.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function seed(): ContentStore {
  return { posts: SEED_POSTS, episodes: SEED_EPISODES };
}

const READ_ONLY_CODES = new Set(["EROFS", "EACCES", "EPERM"]);

export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "This deployment has a read-only filesystem, so content cannot be saved. " +
        "Swap readStore/writeStore in lib/store.ts for a database (Vercel Blob, " +
        "Postgres, KV), or host somewhere with a persistent disk.",
    );
    this.name = "ReadOnlyStoreError";
  }
}

export async function readStore(): Promise<ContentStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ContentStore>;
    return {
      posts: parsed.posts ?? [],
      episodes: parsed.episodes ?? [],
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;

    // No file yet: seed it. On a read-only host (e.g. Vercel) the write fails —
    // serve the seed from memory so pages still render instead of 500ing.
    const initial = seed();
    try {
      await writeStore(initial);
    } catch (writeErr) {
      if (!(writeErr instanceof ReadOnlyStoreError)) throw writeErr;
      console.warn("[store] read-only filesystem — serving seed content in memory.");
    }
    return initial;
  }
}

export async function writeStore(store: ContentStore): Promise<void> {
  // Serialize writes so two concurrent saves can't interleave.
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${DATA_FILE}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
      await fs.rename(tmp, DATA_FILE); // atomic swap — no half-written file
    } catch (err) {
      if (READ_ONLY_CODES.has((err as NodeJS.ErrnoException).code ?? "")) {
        throw new ReadOnlyStoreError();
      }
      throw err;
    }
  });
  await writeQueue;
}

/* ---------------------------------------------------------------- posts --- */

function byDateDesc<T extends { date: string }>(a: T, b: T) {
  return b.date.localeCompare(a.date);
}

export async function getPosts({ includeDrafts = false } = {}): Promise<Post[]> {
  const { posts } = await readStore();
  return posts
    .filter((p) => includeDrafts || p.status === "published")
    .sort(byDateDesc);
}

export async function getPostBySlug(slug: string, { includeDrafts = false } = {}) {
  const { posts } = await readStore();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return undefined;
  if (!includeDrafts && post.status !== "published") return undefined;
  return post;
}

export async function getPostById(id: string) {
  const { posts } = await readStore();
  return posts.find((p) => p.id === id);
}

export async function upsertPost(post: Post): Promise<Post> {
  const store = await readStore();
  const index = store.posts.findIndex((p) => p.id === post.id);
  const next = { ...post, updatedAt: new Date().toISOString() };
  if (index >= 0) store.posts[index] = next;
  else store.posts.unshift(next);
  await writeStore(store);
  return next;
}

export async function deletePost(id: string): Promise<void> {
  const store = await readStore();
  store.posts = store.posts.filter((p) => p.id !== id);
  await writeStore(store);
}

/** Returns the featured post (falls back to the newest published one). */
export async function getFeaturedPost(posts: Post[]) {
  return posts.find((p) => p.featured) ?? posts[0];
}

/* ------------------------------------------------------------- episodes --- */

export async function getEpisodes({ includeDrafts = false } = {}): Promise<Episode[]> {
  const { episodes } = await readStore();
  return episodes
    .filter((e) => includeDrafts || e.status === "published")
    .sort(byDateDesc);
}

export async function getEpisodeById(id: string) {
  const { episodes } = await readStore();
  return episodes.find((e) => e.id === id);
}

export async function upsertEpisode(episode: Episode): Promise<Episode> {
  const store = await readStore();
  const index = store.episodes.findIndex((e) => e.id === episode.id);
  const next = { ...episode, updatedAt: new Date().toISOString() };
  if (index >= 0) store.episodes[index] = next;
  else store.episodes.unshift(next);
  await writeStore(store);
  return next;
}

export async function deleteEpisode(id: string): Promise<void> {
  const store = await readStore();
  store.episodes = store.episodes.filter((e) => e.id !== id);
  await writeStore(store);
}
