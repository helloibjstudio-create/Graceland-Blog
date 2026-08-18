"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  /** Controlled value — when passed, the parent owns the state. */
  value?: string;
  onValueChange?: (url: string) => void;
};

export default function ImageUpload({
  name,
  defaultValue = "",
  label = "Cover image",
  value,
  onValueChange,
}: Props) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [internalUrl, setInternalUrl] = useState(defaultValue);
  const url = value ?? internalUrl;
  const setUrl = (next: string) => {
    if (value === undefined) setInternalUrl(next);
    onValueChange?.(next);
  };
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep the internal state in sync when the parent updates the controlled value
  // (e.g. after a "Pull thumbnail" click).
  useEffect(() => {
    if (value !== undefined) setInternalUrl(value);
  }, [value]);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url!);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="field">
      <label>{label}</label>

      <div className="img-upload-tabs">
        <button type="button" className={`img-tab${tab === "url" ? " is-active" : ""}`} onClick={() => setTab("url")}>
          Paste URL
        </button>
        <button type="button" className={`img-tab${tab === "upload" ? " is-active" : ""}`} onClick={() => setTab("upload")}>
          Upload file
        </button>
      </div>

      {tab === "url" ? (
        <input
          type="text"
          placeholder="https://… or /images/my-photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      ) : (
        <div
          className={`img-dropzone${uploading ? " is-uploading" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <span>Click or drag an image here to upload</span>
          )}
        </div>
      )}

      {error && <span className="hint" style={{ color: "var(--rose, #e55)" }}>{error}</span>}

      {url && (
        <img src={url} alt="Preview" className="img-preview" />
      )}

      <input type="hidden" name={name} value={url} onChange={() => {}} />
    </div>
  );
}
