# Graceland Psychiatry & TMS Center — Web

Next.js 16 (App Router, React 19, TypeScript) front end for the Graceland
Psychiatry Resources section, with a built-in content studio.

```bash
npm install
npm run admin:create -- you@gracelandpsychiatry.com "a-strong-password"
npm run dev            # http://localhost:3000
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home (placeholder hero + services + latest posts) |
| `/blog` | Blog index: featured post, filters, article grid, newsletter, topics, pagination |
| `/blog/[slug]` | Article page: sticky contents sidebar, reading progress, pull quotes, comparison table, stat tiles, inline CTA, author card, related posts |
| `/podcast` | Psychiatry Perspectives: hero, platform links, latest episode, episode grid, host bio, newsletter |
| `/admin` | Content studio (sign-in required) |

Both Resources pages hang off the header's **Resources** dropdown → *Blog*,
*Podcast* — hover on desktop, tap-to-expand inside the mobile drawer.

## Motion

- **Parallax** — `components/parallax-provider.tsx` drives every
  `[data-parallax="0.22"]` element from one `requestAnimationFrame` loop.
- **Neural field** — `components/neural-field.tsx` draws a drifting neuron
  network on the dark heroes; nodes are gently attracted to the pointer, and the
  canvas pauses when scrolled out of view.
- **Scroll reveals** — wrap anything in `<Reveal delay={90} from="up">`.
- **Ambient** — aurora drift behind dark sections, breathing gradient on the
  featured card, image zoom on card hover, sticky header that condenses on
  scroll, `<CountUp>` for statistics.

Everything above is disabled under `prefers-reduced-motion: reduce`.

## Content studio

Sign in at `/admin/login`.

- **Overview** — publish/draft counts, recent posts and episodes, quick actions.
- **Blog posts** — create, edit, publish/unpublish, delete. Body is Markdown:
  `##` headings become sidebar contents entries, `>` becomes a pull quote,
  tables get the comparison styling.
- **Podcast episodes** — same lifecycle for episodes on `/podcast`.
- **Preview links** — every post has a signed, shareable preview URL
  (`/api/preview?slug=…&token=…`). It turns on Next.js draft mode, so a reviewer
  can read an unpublished draft without an admin account. A floating banner
  offers *Exit preview*.

### Where content lives

`data/content.json` — a single JSON document, seeded from `lib/posts.ts` and
`lib/episodes.ts` on first run. Writes are queued and atomic (temp file +
rename). To move to a database, replace `readStore` / `writeStore` in
`lib/store.ts`; nothing else changes.

Public pages are statically rendered with `revalidate = 60`, and every CMS save
calls `revalidatePath`, so edits appear immediately.

### Rich hand-coded articles

The flagship TMS article is a React component (`content/tms-therapy.tsx`) so it
can use the fact box, numbered steps and stat tiles. `content/index.ts` maps
slugs to those components. If a post has Markdown in its `body`, the Markdown
wins; otherwise the coded component renders; otherwise the excerpt shows with a
"coming soon" note.

## Auth

`npm run admin:create` writes three values to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | HMAC key for session cookies and preview tokens |
| `ADMIN_EMAIL` | The one admin account |
| `ADMIN_PASSWORD_HASH` | `salt:scrypt` hash — the password itself is never stored |

Sessions are signed, HTTP-only cookies (7 days, `secure` in production). Admin
pages are guarded in `app/admin/(dashboard)/layout.tsx` and every server action
re-checks the session, so a stale form cannot mutate content.

## Images

Drop files into `public/images/` using the paths referenced in the content store
(`/images/hero-brain.jpg`, `/images/ep-spravato.jpg`, …). Until a file exists,
`components/media.tsx` shows a gradient placeholder instead of a broken image.

## Notes / next steps

- Markdown is rendered without HTML sanitisation. That is fine for a single
  trusted admin; add `isomorphic-dompurify` before opening authoring to more
  people.
- `Home`, `Our Team`, `Services`, `About Us`, `Contact` and `Privacy Policy` are
  linked from the nav and footer but only `/` exists so far.
- The newsletter forms are front-end only — wire `components/newsletter-form.tsx`
  to your email platform.
- `prototype-static/` holds the original static HTML/CSS mockup this app was
  built from; it is excluded from the TypeScript project and can be deleted.
- The file store needs a writable disk. On Vercel or another read-only/serverless
  host, swap the store for a database (see above).
