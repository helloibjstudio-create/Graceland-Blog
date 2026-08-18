"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "saving" | "saved" | "error";

type Props = {
  formRef: React.RefObject<HTMLFormElement | null>;
  endpoint: "/api/autosave-post" | "/api/autosave-episode";
  /** URL path prefix like /admin/posts — used to swap the URL after a *new* record gets its id. */
  redirectBase: string;
  /** How long to wait after the last change before saving. */
  debounceMs?: number;
};

const RELATIVE_TIME = (d: Date) => {
  const s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function Autosave({ formRef, endpoint, redirectBase, debounceMs = 1200 }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const dirtyRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const pendingAfterRef = useRef(false);
  const [, force] = useState(0);

  const save = useCallback(async () => {
    const form = formRef.current;
    if (!form) return;
    if (savingRef.current) {
      // Another save is in flight — queue one more after it finishes.
      pendingAfterRef.current = true;
      return;
    }
    savingRef.current = true;
    setStatus("saving");
    try {
      const fd = new FormData(form);
      const res = await fetch(endpoint, { method: "POST", body: fd, keepalive: true });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string; skipped?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? `Autosave failed (${res.status})`);
      if (json.skipped) {
        // Server chose not to persist (e.g. empty title). Not an error.
        setStatus("idle");
      } else if (json.id) {
        // If this was a brand-new record, sync the id into the form + URL
        const idField = form.querySelector<HTMLInputElement>('input[name="id"]');
        if (idField && idField.value !== json.id) {
          idField.value = json.id;
          window.history.replaceState(null, "", `${redirectBase}/${json.id}`);
        }
        setSavedAt(new Date());
        setStatus("saved");
        dirtyRef.current = false;
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    } finally {
      savingRef.current = false;
      if (pendingAfterRef.current) {
        pendingAfterRef.current = false;
        save();
      }
    }
  }, [endpoint, formRef, redirectBase]);

  // Listen for any change/input on the form and debounce a save.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onChange = () => {
      dirtyRef.current = true;
      setStatus((s) => (s === "error" ? s : "idle"));
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => save(), debounceMs);
    };
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    return () => {
      form.removeEventListener("input", onChange);
      form.removeEventListener("change", onChange);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [formRef, debounceMs, save]);

  // If a save is pending when the tab hides or the user tries to leave, flush it.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const flush = () => {
      if (!dirtyRef.current) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      const fd = new FormData(form);
      // `keepalive` lets the browser finish this request even during unload.
      fetch(endpoint, { method: "POST", body: fd, keepalive: true }).catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endpoint, formRef]);

  // Re-render the "5s ago"/"1m ago" label periodically.
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, [savedAt]);

  // After a successful autosave, quietly refresh the router so any "last updated"
  // timestamp elsewhere on the page stays current.
  useEffect(() => {
    if (status === "saved") {
      router.refresh();
    }
  }, [status, savedAt, router]);

  return (
    <div className={`autosave autosave--${status}`} role="status" aria-live="polite">
      <span className="autosave-dot" />
      <span>
        {status === "saving" && "Saving draft…"}
        {status === "saved" && savedAt && `Draft saved · ${RELATIVE_TIME(savedAt)}`}
        {status === "idle" && (savedAt ? `Draft saved · ${RELATIVE_TIME(savedAt)}` : "Autosave on")}
        {status === "error" && `Autosave paused — ${errorMsg}`}
      </span>
    </div>
  );
}
