"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { savePostAction, suggestPostMetadata, type ActionState } from "@/app/admin/actions";
import { TAG_VARIANTS, TOPIC_FILTERS, slugify } from "@/lib/posts";
import type { Post } from "@/lib/types";
import CopyButton from "./copy-button";
import ImageUpload from "./image-upload";
import RichTextEditor from "./rich-text-editor";

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
  const [aiPending, startAi] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [topic, setTopic] = useState(post?.topic ?? "wellness");
  const [tag, setTag] = useState(post?.tag ?? "Mental Wellness");
  const [variant, setVariant] = useState(post?.variant ?? "blue");
  const [aiError, setAiError] = useState("");

  const effectiveSlug = slugTouched ? slug : slugify(title);

  const handleSuggest = () => {
    setAiError("");
    const bodyEl = document.querySelector<HTMLInputElement>('input[name="body"]');
    const bodyText = bodyEl?.value?.replace(/<[^>]+>/g, " ").trim() ?? "";
    startAi(async () => {
      const result = await suggestPostMetadata(title, bodyText);
      if ("error" in result) {
        setAiError(result.error);
      } else {
        if (result.topic) setTopic(result.topic);
        if (result.tag) setTag(result.tag);
        if (result.variant) setVariant(result.variant as typeof variant);
        if (result.excerpt) setExcerpt(result.excerpt);
      }
    });
  };

  return (
    <form action={action}>
      <input type="hidden" name="id" value={post?.id ?? ""} />

      <div className="admin-topbar">
        <div>
          <h1>{post ? "Edit post" : "New post"}</h1>
          <p>
            {post
              ? `Last saved ${new Date(post.updatedAt).toLocaleString("en-US")}`
              : "Drafts stay private until you publish."}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/admin/posts">Back to posts</Link>
          <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save post"}
          </button>
        </div>
      </div>

      {saved && <div className="alert alert-ok">Saved.</div>}
      {state.error && <div className="alert alert-error">{state.error}</div>}

      <div className="editor-grid">
        {/* ── main column ── */}
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
                onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              />
              <span className="hint">/blog/{effectiveSlug || "…"}</span>
            </div>

            <div className="field">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                style={{ minHeight: 80 }}
              />
              <span className="hint">Shown on cards, in search results and social shares.</span>
            </div>

            <div className="field">
              <label>Body</label>
              <RichTextEditor name="body" initialContent={post?.body ?? ""} />
              {hasCodedBody && !post?.body && (
                <span className="hint">
                  This post currently renders a hand-coded component. Anything typed here replaces it.
                </span>
              )}
            </div>

          </div>

          <div className="form-foot">
            <span className="admin-sub">{post ? `ID ${post.id}` : "New ID on save."}</span>
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save post"}
            </button>
          </div>
        </div>

        {/* ── sidebar ── */}
        <div className="editor-side">

          {/* AI suggest */}
          <div className="panel">
            <div className="panel-head">
              <h2>AI Assistant</h2>
            </div>
            <div className="panel-body form-grid">
              <p style={{ fontSize: ".85rem", margin: 0, color: "#666" }}>
                Auto-fill tag, topic, colour and excerpt from the title and body.
              </p>
              {aiError && <span className="hint" style={{ color: "var(--rose,#e55)" }}>{aiError}</span>}
              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={handleSuggest}
                disabled={aiPending || !title}
                style={{ width: "100%" }}
              >
                {aiPending ? "Thinking…" : "✦ Suggest metadata"}
              </button>
            </div>
          </div>

          {/* Publishing */}
          <div className="panel">
            <div className="panel-head"><h2>Publishing</h2></div>
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
                <input id="date" name="date" type="date" defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)} />
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
                  <span className="hint">Signed link — share without signing in.</span>
                </div>
              )}
            </div>
          </div>

          {/* Presentation */}
          <div className="panel">
            <div className="panel-head"><h2>Presentation</h2></div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="tag">Tag label</label>
                <input id="tag" name="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="topic">Topic (filter)</label>
                  <select id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="variant">Tag colour</label>
                  <select id="variant" name="variant" value={variant} onChange={(e) => setVariant(e.target.value as typeof variant)}>
                    {TAG_VARIANTS.map((v) => (
                      <option key={v} value={v}>{v}</option>
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
                  <input id="readTime" name="readTime" type="number" min={1} max={60} defaultValue={post?.readTime ?? ""} placeholder="auto" />
                </div>
              </div>

              <ImageUpload name="image" defaultValue={post?.image ?? ""} label="Cover image" />

              <div className="field">
                <label htmlFor="episodeUrl">Companion episode link</label>
                <input id="episodeUrl" name="episodeUrl" defaultValue={post?.episodeUrl ?? ""} placeholder="/podcast" />
                <span className="hint">Adds the "Listen to the Episode" button.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
