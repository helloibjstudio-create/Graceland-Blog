import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { getSession, verifyPreviewToken } from "@/lib/auth";
import { getPostBySlug } from "@/lib/store";

/**
 * Shareable preview link:  /api/preview?slug=<slug>&token=<hmac>
 *
 * The token is an HMAC of the slug (see lib/auth.ts), so an editor can send the
 * link to a reviewer without giving them admin access. A signed-in admin can
 * also open a preview without a token.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const token = request.nextUrl.searchParams.get("token");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const session = await getSession();
  if (!session && !verifyPreviewToken(slug, token)) {
    return NextResponse.json({ error: "Invalid preview token" }, { status: 401 });
  }

  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) {
    return NextResponse.json({ error: "No post with that slug" }, { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/blog/${post.slug}`);
}
