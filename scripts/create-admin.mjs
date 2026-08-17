#!/usr/bin/env node
/**
 * Generates the three environment values the admin area needs and writes them
 * to .env.local (existing values are preserved unless you pass --force).
 *
 *   npm run admin:create -- you@example.com "a-strong-password"
 */
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [email, password] = process.argv.slice(2).filter((a) => a !== "--force");
const force = process.argv.includes("--force");

if (!email || !password) {
  console.error('Usage: npm run admin:create -- you@example.com "your-password"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Choose a password of at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const envPath = path.join(process.cwd(), ".env.local");

const values = {
  AUTH_SECRET: randomBytes(32).toString("base64url"),
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD_HASH: `${salt}:${hash}`,
};

let existing = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) existing[match[1]] = match[2];
  }
  if (existing.AUTH_SECRET && !force) values.AUTH_SECRET = existing.AUTH_SECRET;
}

const merged = { ...existing, ...values };
const body = Object.entries(merged)
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

writeFileSync(envPath, `${body}\n`, "utf8");

console.log(`✓ Wrote admin credentials to .env.local`);
console.log(`  ADMIN_EMAIL=${email}`);
console.log(`  AUTH_SECRET  ${force || !existing.AUTH_SECRET ? "generated" : "kept existing"}`);
console.log(`\nRestart the dev server, then sign in at /admin/login`);
