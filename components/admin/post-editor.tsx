"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { savePostAction, type ActionState } from "@/app/admin/actions";
import { TAG_VARIANTS, TOPIC_FILTERS, slugify } from "@/lib/posts";
import type { Post } from "@/lib/types";
import CopyButton from "./copy-button";

const INITIAL: ActionState = {};

const TOPICS = TOPIC_FILTERS.filter((t) => t.value !== "all");

export default function PostEditor({
  post,
  previewUrl,
  saved,
  hasCodedBody,
}: {
  post?: Post;
  previewUrl: string | null;
  saved?: boolean;
  hasCodedBody?: boolean;
}) {
  const [state, action, pending] = useActionState(savePostAction, INITIAL);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={post?.id ?? ""} />

      <div className="admin-topbar">
        <div>
          <h1>{post ? "Edit post" : "New post"}</h1>
          <p>
            {post
              ? `Last saved ${new Date(post.updatedAt).toLocaleString("en-US")}`
              : "Drafts stay private until you publish — share the preview link for review."}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/admin/posts">
            Back to posts
          </Link>
          <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save post"}
          </button>
        </div>
      </div>

      {saved && <div className="alert alert-ok">Saved.</div>}
      {state.error && <div className="alert alert-error">{state.error}</div>}

      <div className="editor-grid">
        {/* ---------------- main column ---------------- */}
        <div className="panel">
          <div className="panel-body form-grid">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="slug">URL slug</label>
              <input
                id="slug"
                name="slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
              <span className="hint">/blog/{effectiveSlug || "…"}</span>
            </div>

            <div className="field">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                defaultValue={post?.excerpt ?? ""}
                required
                style={{ minHeight: 90 }}
              />
              <span className="hint">Shown on cards, in search results and social shares.</span>
            </div>

            <div className="field">
              <label htmlFor="body">Body (Markdown)</label>
              <textarea id="body" name="body" className="code" defaultValue={post?.body ?? ""} />
              {hasCodedBody && !post?.body && (
                <span className="hint">
                  This post currently renders the hand-coded article component. Anything you type
                  here replaces it.
                </span>
              )}
            </div>

            <p className="markdown-help">
              <code>## Heading</code> becomes a sidebar contents entry ·{" "}
              <code>&gt; quote</code> renders as a pull quote · tables get the comparison styling ·{" "}
              <code>- item</code> for bullet lists.
            </p>
          </div>

          <div className="form-foot">
            <span className="admin-sub">
              {post ? `ID ${post.id}` : "A new ID is assigned on save."}
            </span>
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save post"}
            </button>
          </div>
        </div>

        {/* ---------------- sidebar ---------------- */}
        <div className="editor-side">
          <div className="panel">
            <div className="panel-head">
              <h2>Publishing</h2>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={post?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="date">Publish date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)}
                />
              </div>

              <label className="check">
                <input type="checkbox" name="featured" defaultChecked={post?.featured} />
                Feature at the top of /blog
              </label>

              {previewUrl && (
                <div className="field">
                  <label>Shareable preview link</label>
                  <div className="preview-box">{previewUrl}</div>
                  <CopyButton value={previewUrl} />
                  <span className="hint">
                    Signed link — a reviewer can open the draft without signing in.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Presentation</h2>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="tag">Tag label</label>
                <input id="tag" name="tag" defaultValue={post?.tag ?? "Mental Wellness"} />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="topic">Topic (filter)</label>
                  <select id="topic" name="topic" defaultValue={post?.topic ?? "wellness"}>
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="variant">Tag colour</label>
                  <select id="variant" name="variant" defaultValue={post?.variant ?? "blue"}>
                    {TAG_VARIANTS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="author">Author</label>
                  <select id="author" name="author" defaultValue={post?.author ?? "popoola"}>
                    <option value="popoola">Dr. Femi Popoola</option>
                    <option value="team">Graceland Psychiatry</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="readTime">Read time (min)</label>
                  <input
                    id="readTime"
                    name="readTime"
                    type="number"
                    min={1}
                    max={60}
                    defaultValue={post?.readTime ?? ""}
                    placeholder="auto"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="image">Cover image path</label>
                <input
                  id="image"
                  name="image"
                  defaultValue={post?.image ?? ""}
                  placeholder="/images/my-post.jpg"
                />
                <span className="hint">Drop the file into /public/images.</span>
              </div>

              <div className="field">
                <label htmlFor="episodeUrl">Companion episode link</label>
                <input
                  id="episodeUrl"
                  name="episodeUrl"
                  defaultValue={post?.episodeUrl ?? ""}
                  placeholder="/podcast"
                />
                <span className="hint">Adds the “Listen to the Episode” button.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
