import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Given a video URL, returns { url: <thumbnail image url> }.
 * Fast path for YouTube (deterministic image URL, no fetch needed).
 * Vimeo and other providers fall through to oEmbed + og:image scraping.
 */
export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = req.nextUrl.searchParams.get("url")?.trim();
  if (!raw) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // 1) YouTube — parse the id straight out of the URL, no network call.
  const yt = youtubeId(target);
  if (yt) {
    // Prefer maxres; fall back to hqdefault if maxres 404s (some uploads lack it).
    const maxres = `https://img.youtube.com/vi/${yt}/maxresdefault.jpg`;
    const ok = await headOk(maxres);
    return NextResponse.json({
      url: ok ? maxres : `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      source: "youtube",
    });
  }

  // 2) Vimeo — oEmbed gives us the thumbnail.
  if (/vimeo\.com/i.test(target.hostname)) {
    const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target.toString())}`;
    const r = await fetch(oembed).catch(() => null);
    if (r?.ok) {
      const j = (await r.json()) as { thumbnail_url?: string };
      if (j.thumbnail_url) return NextResponse.json({ url: j.thumbnail_url, source: "vimeo" });
    }
  }

  // 3) Generic — try oEmbed discovery + og:image fallback.
  const og = await scrapeOgImage(target.toString());
  if (og) return NextResponse.json({ url: og, source: "og" });

  return NextResponse.json({ error: "Could not find a thumbnail for that URL" }, { status: 404 });
}

function youtubeId(u: URL): string | null {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] ?? null;
  if (!host.endsWith("youtube.com") && host !== "youtube-nocookie.com") return null;
  const v = u.searchParams.get("v");
  if (v) return v;
  const parts = u.pathname.split("/").filter(Boolean);
  // /embed/ID, /shorts/ID, /live/ID
  if (["embed", "shorts", "live", "v"].includes(parts[0])) return parts[1] ?? null;
  return null;
}

async function headOk(url: string) {
  try {
    // YouTube ignores HEAD sometimes; use GET but only read a few bytes.
    const r = await fetch(url, { method: "GET" });
    if (!r.ok) return false;
    // YouTube returns a 120x90 placeholder for missing maxres — check content length.
    const len = Number(r.headers.get("content-length") ?? "0");
    return len === 0 || len > 5000;
  } catch {
    return false;
  }
}

async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; GracelandBot/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m) return null;
    const src = m[1];
    // Resolve relative URLs against the page.
    return new URL(src, url).toString();
  } catch {
    return null;
  }
}
