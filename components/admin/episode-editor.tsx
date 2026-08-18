"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import { saveEpisodeAction, suggestEpisodeMetadata, type ActionState } from "@/app/admin/actions";
import { TAG_VARIANTS } from "@/lib/posts";
import type { Episode } from "@/lib/types";
import Autosave from "./autosave";
import ImageUpload from "./image-upload";
import PostedToast from "./posted-toast";

const INITIAL: ActionState = {};

export default function EpisodeEditor({
  episode,
  saved,
}: {
  episode?: Episode;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveEpisodeAction, INITIAL);
  const [aiPending, startAi] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [image, setImage] = useState(episode?.image ?? "");
  const [thumbStatus, setThumbStatus] = useState<"idle" | "loading" | "error">("idle");
  const [thumbError, setThumbError] = useState("");

  const pullThumbnail = async (silent = false) => {
    const url = formRef.current?.querySelector<HTMLInputElement>('input[name="youtubeUrl"]')?.value?.trim();
    if (!url) {
      if (!silent) {
        setThumbStatus("error");
        setThumbError("Add a video URL first.");
      }
      return;
    }
    setThumbStatus("loading");
    setThumbError("");
    try {
      const res = await fetch(`/api/video-thumbnail?url=${encodeURIComponent(url)}`);
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "No thumbnail found");
      setImage(json.url);
      setThumbStatus("idle");
    } catch (err) {
      if (silent) {
        setThumbStatus("idle");
      } else {
        setThumbStatus("error");
        setThumbError((err as Error).message);
      }
    }
  };

  const debounceRef = useRef<number | null>(null);
  const onVideoUrlChange = () => {
    if (image) return; // don't override an image the user already picked
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => pullThumbnail(true), 700);
  };
  const onVideoUrlBlur = () => {
    if (!image) pullThumbnail(true);
  };

  const publishNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (!form) return;
    const statusEl = form.querySelector<HTMLSelectElement>('select[name="status"]');
    if (statusEl) statusEl.value = "published";
    form.requestSubmit();
  };

  const [title, setTitle] = useState(episode?.title ?? "");
  const [tag, setTag] = useState(episode?.tag ?? "Mental Health 101");
  const [variant, setVariant] = useState(episode?.variant ?? "blue");
  const [aiError, setAiError] = useState("");

  const handleSuggest = () => {
    setAiError("");
    const summaryEl = document.getElementById("summary") as HTMLTextAreaElement | null;
    const summary = summaryEl?.value ?? "";
    startAi(async () => {
      const result = await suggestEpisodeMetadata(title, summary);
      if ("error" in result) {
        setAiError(result.error);
      } else {
        if (result.tag) setTag(result.tag);
        if (result.variant) setVariant(result.variant as typeof variant);
      }
    });
  };

  return (
    <form action={action} ref={formRef}>
      <Autosave formRef={formRef} endpoint="/api/autosave-episode" redirectBase="/admin/episodes" />
      <input type="hidden" name="id" defaultValue={episode?.id ?? ""} />

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
          <Link className="btn btn-quiet btn-sm" href="/admin/episodes">Back to episodes</Link>
          <button className="btn btn-quiet btn-sm" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={publishNow}
            disabled={pending}
            title="Set status to published and save"
          >
            {episode?.status === "published" ? "Update live episode" : "Publish now"}
          </button>
        </div>
      </div>

      <PostedToast show={Boolean(saved)} label={episode?.status === "published" ? "Published!" : "Saved!"} />
      {state.error && <div className="alert alert-error">{state.error}</div>}

      <div className="editor-grid">
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
              <textarea id="note" name="note" defaultValue={episode?.note ?? ""} style={{ minHeight: 80 }} />
              <span className="hint">Shown in the highlighted box on the latest episode.</span>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="youtubeUrl">Video URL</label>
                <div className="field-inline">
                  <input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    defaultValue={episode?.youtubeUrl ?? ""}
                    placeholder="YouTube, Vimeo, or any page with a video"
                    onChange={onVideoUrlChange}
                    onBlur={onVideoUrlBlur}
                  />
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => pullThumbnail(false)}
                    disabled={thumbStatus === "loading"}
                    title="Fetch the thumbnail from the video URL"
                  >
                    {thumbStatus === "loading" ? "Fetching…" : "Pull thumbnail"}
                  </button>
                </div>
                {thumbStatus === "error" && (
                  <span className="hint" style={{ color: "#c33" }}>{thumbError}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="listenUrl">Audio URL</label>
                <input id="listenUrl" name="listenUrl" defaultValue={episode?.listenUrl ?? ""} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="articleHref">Companion article path</label>
              <input id="articleHref" name="articleHref" defaultValue={episode?.articleHref ?? ""} placeholder="/blog/my-post-slug" />
            </div>

          </div>

          <div className="form-foot">
            <span className="admin-sub">{episode ? `ID ${episode.id}` : "New ID on save."}</span>
            <div className="admin-actions">
              <button className="btn btn-quiet" type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={publishNow}
                disabled={pending}
              >
                {episode?.status === "published" ? "Update live episode" : "Publish now"}
              </button>
            </div>
          </div>
        </div>

        <div className="editor-side">

          {/* AI suggest */}
          <div className="panel">
            <div className="panel-head"><h2>AI Assistant</h2></div>
            <div className="panel-body form-grid">
              <p style={{ fontSize: ".85rem", margin: 0, color: "#666" }}>
                Auto-fill tag and colour from the title and summary.
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
                <select id="status" name="status" defaultValue={episode?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="date">Air date</label>
                <input id="date" name="date" type="date" defaultValue={episode?.date ?? new Date().toISOString().slice(0, 10)} />
              </div>
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
              <div className="field">
                <label htmlFor="variant">Tag colour</label>
                <select id="variant" name="variant" value={variant} onChange={(e) => setVariant(e.target.value as typeof variant)}>
                  {TAG_VARIANTS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <ImageUpload
                name="image"
                label="Thumbnail"
                value={image}
                onValueChange={setImage}
              />

              <div className="field">
                <label htmlFor="gradient">Fallback gradient</label>
                <input id="gradient" name="gradient" defaultValue={episode?.gradient ?? "linear-gradient(150deg,#123B52,#1D6E96)"} />
                <span className="hint">Used until the thumbnail exists.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
