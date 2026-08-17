"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveEpisodeAction, type ActionState } from "@/app/admin/actions";
import { TAG_VARIANTS } from "@/lib/posts";
import type { Episode } from "@/lib/types";

const INITIAL: ActionState = {};

export default function EpisodeEditor({
  episode,
  saved,
}: {
  episode?: Episode;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveEpisodeAction, INITIAL);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={episode?.id ?? ""} />

      <div className="admin-topbar">
        <div>
          <h1>{episode ? "Edit episode" : "New episode"}</h1>
          <p>
            {episode
              ? `Last saved ${new Date(episode.updatedAt).toLocaleString("en-US")}`
              : "Episodes appear on /podcast newest first."}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-quiet btn-sm" href="/admin/episodes">
            Back to episodes
          </Link>
          <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save episode"}
          </button>
        </div>
      </div>

      {saved && <div className="alert alert-ok">Saved.</div>}
      {state.error && <div className="alert alert-error">{state.error}</div>}

      <div className="editor-grid">
        <div className="panel">
          <div className="panel-body form-grid">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={episode?.title ?? ""} required />
            </div>

            <div className="field">
              <label htmlFor="slug">Slug</label>
              <input id="slug" name="slug" defaultValue={episode?.slug ?? ""} />
              <span className="hint">Leave blank to generate from the title.</span>
            </div>

            <div className="field">
              <label htmlFor="summary">Summary</label>
              <textarea id="summary" name="summary" defaultValue={episode?.summary ?? ""} />
            </div>

            <div className="field">
              <label htmlFor="note">Callout note (optional)</label>
              <textarea
                id="note"
                name="note"
                defaultValue={episode?.note ?? ""}
                style={{ minHeight: 80 }}
              />
              <span className="hint">Shown in the highlighted box on the latest episode.</span>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="youtubeUrl">YouTube URL</label>
                <input id="youtubeUrl" name="youtubeUrl" defaultValue={episode?.youtubeUrl ?? ""} />
              </div>
              <div className="field">
                <label htmlFor="listenUrl">Audio URL</label>
                <input id="listenUrl" name="listenUrl" defaultValue={episode?.listenUrl ?? ""} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="articleHref">Companion article path</label>
              <input
                id="articleHref"
                name="articleHref"
                defaultValue={episode?.articleHref ?? ""}
                placeholder="/blog/my-post-slug"
              />
            </div>
          </div>

          <div className="form-foot">
            <span className="admin-sub">
              {episode ? `ID ${episode.id}` : "A new ID is assigned on save."}
            </span>
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save episode"}
            </button>
          </div>
        </div>

        <div className="editor-side">
          <div className="panel">
            <div className="panel-head">
              <h2>Publishing</h2>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={episode?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="date">Air date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={episode?.date ?? new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Presentation</h2>
            </div>
            <div className="panel-body form-grid">
              <div className="field">
                <label htmlFor="tag">Tag label</label>
                <input id="tag" name="tag" defaultValue={episode?.tag ?? "Mental Health 101"} />
              </div>
              <div className="field">
                <label htmlFor="variant">Tag colour</label>
                <select id="variant" name="variant" defaultValue={episode?.variant ?? "blue"}>
                  {TAG_VARIANTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="image">Thumbnail path</label>
                <input
                  id="image"
                  name="image"
                  defaultValue={episode?.image ?? ""}
                  placeholder="/images/ep-my-episode.jpg"
                />
              </div>
              <div className="field">
                <label htmlFor="gradient">Fallback gradient</label>
                <input
                  id="gradient"
                  name="gradient"
                  defaultValue={episode?.gradient ?? "linear-gradient(150deg,#123B52,#1D6E96)"}
                />
                <span className="hint">Used until the thumbnail file exists.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
