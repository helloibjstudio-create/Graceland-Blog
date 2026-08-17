@AGENTS.md

## Context hygiene — read this before reading anything else

This project contains a few files that are large enough to exhaust the context
window in a single read. Reading one of them ends the session with
"Prompt is too long" and also makes /compact fail.

Never read, open, grep, or @-mention these:

- `public/images/podcast hero section.svg` — ~10 MB. It is a Figma export with
  two base64-embedded raster images on 59 very long lines. To swap the hero
  image, replace the file; never read its contents.
- `tsconfig.tsbuildinfo` (~250 KB, generated), `package-lock.json` (~73 KB),
  `.next/` (build output), `public/images/mona-sans/*.ttf` (font binaries).

The Next.js rules above point to `node_modules/next/dist/docs/`. That directory
is 4 MB across 444 files, and single guides run 30-60 KB. Grep it for the
specific API in question and read at most one guide per task. Never read a
whole doc folder.

When inspecting large files generally: grep for what you need, or read a line
range. Do not read a whole file to find one symbol.
