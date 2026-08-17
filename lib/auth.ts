import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Small, dependency-free auth for the admin area.
 *
 *  - Password is stored as a scrypt hash (`salt:hash`) in ADMIN_PASSWORD_HASH.
 *  - The session is a signed, HTTP-only cookie: base64(payload).hmac
 *  - Preview links carry an HMAC of the slug, so they can be shared with a
 *    reviewer without handing over admin credentials.
 *
 * Generate credentials with:  npm run admin:create
 */

const SESSION_COOKIE = "gp_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Run `npm run admin:create` and copy the values into .env.local.",
    );
  }
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------ passwords --- */

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64).toString("hex");
  return safeEqual(derived, hash);
}

/* -------------------------------------------------------------- session --- */

export type Session = { email: string; exp: number };

export function createSessionToken(email: string) {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS } satisfies Session);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString()) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Guard for admin pages and server actions. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function startSession(email: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function checkCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    throw new Error(
      "ADMIN_EMAIL / ADMIN_PASSWORD_HASH are not set. Run `npm run admin:create` first.",
    );
  }
  const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordOk = verifyPassword(password, adminHash);
  return emailOk && passwordOk;
}

/* -------------------------------------------------------------- preview --- */

export function previewToken(slug: string) {
  return sign(`preview:${slug}`);
}

export function verifyPreviewToken(slug: string, token: string | null) {
  return Boolean(token) && safeEqual(token as string, previewToken(slug));
}

export function previewPath(slug: string) {
  return `/api/preview?slug=${encodeURIComponent(slug)}&token=${previewToken(slug)}`;
}
