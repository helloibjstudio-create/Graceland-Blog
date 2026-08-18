import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const KINDS = new Set(["post", "episode"]);
const EVENTS = new Set(["view", "read", "share"]);

export async function POST(req: NextRequest) {
  // Skip logged-in admin traffic so the editor's own visits don't inflate numbers.
  if (await getSession()) return NextResponse.json({ skipped: true });

  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|preview|lighthouse/i.test(ua)) {
    return NextResponse.json({ skipped: true });
  }

  let body: { kind?: string; slug?: string; event?: string; sessionId?: string; referrer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const kind = body.kind;
  const slug = body.slug?.trim();
  const event = body.event ?? "view";
  if (!kind || !KINDS.has(kind) || !slug || !EVENTS.has(event)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { error } = await supabase.from("pageviews").insert({
    kind,
    slug,
    event,
    session_id: body.sessionId ?? null,
    referrer: body.referrer ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
