import type { Episode } from "./types";

export type { Episode } from "./types";

/**
 * Returns a usable thumbnail URL for an episode. Falls back to deriving one
 * from the YouTube video URL when the editor didn't set an explicit image —
 * so freshly-published episodes never render as a blank gradient.
 */
export function episodeThumbnail(ep: Pick<Episode, "image" | "youtubeUrl">): string | undefined {
  if (ep.image) return ep.image;
  const id = youtubeVideoId(ep.youtubeUrl);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined;
}

export function youtubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] ?? null;
  if (!host.endsWith("youtube.com") && host !== "youtube-nocookie.com") return null;
  const v = u.searchParams.get("v");
  if (v) return v;
  const parts = u.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) return parts[1] ?? null;
  return null;
}

export const PLATFORMS = [
  { name: "Spotify", action: "Listen Free →", color: "#1DB954", href: "#" },
  { name: "Apple Podcasts", action: "Subscribe →", color: "#9B59D0", href: "#" },
  { name: "YouTube", action: "Watch →", color: "#FF0033", href: "#" },
  { name: "iHeart Radio", action: "Listen →", color: "#C6002B", href: "#" },
  { name: "Pocket Casts", action: "Subscribe →", color: "#E23A3A", href: "#" },
  { name: "Overcast", action: "Listen →", color: "#FC7E0F", href: "#" },
];

const CHANNEL = "https://www.youtube.com/@gracelandpsychiatry";

export const SEED_EPISODES: Episode[] = [
  {
    id: "ep-spravato",
    slug: "spravato-depression-treatment-hours-not-weeks",
    title: "Spravato: The FDA-Approved Depression Treatment That Works in Hours, Not Weeks",
    summary:
      "Dr. Popoola explains esketamine (Spravato) — how it differs from standard antidepressants and what the January 2025 standalone FDA approval means for patients.",
    tag: "Spravato",
    variant: "green",
    date: "2026-07-08",
    image: "/images/ep-spravato.jpg",
    gradient: "linear-gradient(150deg,#0F2E44,#0A3D5C)",
    youtubeUrl: CHANNEL,
    listenUrl: "#",
    note: "Spravato received standalone FDA approval in January 2025 — the first treatment-resistant depression treatment to do so.",
    articleHref: "/blog/spravato-fda-approved-nasal-spray-depression",
    status: "published",
    updatedAt: "2026-07-08T09:00:00.000Z",
  },
  {
    id: "ep-psychiatrist-vs-therapist",
    slug: "psychiatrist-vs-therapist",
    title: "Psychiatrist vs Therapist — Which One Do You Actually Need?",
    summary:
      "The practical difference between psychiatrists and therapists, when you need both, and how to take a first step.",
    tag: "Mental Health 101",
    variant: "amber",
    date: "2026-07-01",
    image: "/images/ep-psychiatrist-vs-therapist.jpg",
    gradient: "linear-gradient(150deg,#B23A2E,#7A2A22)",
    youtubeUrl: CHANNEL,
    status: "published",
    updatedAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "ep-tms",
    slug: "what-is-tms-therapy",
    title: "What Is TMS Therapy? A Psychiatrist Explains How It Works",
    summary:
      "How TMS works, who it is right for, what a session feels like, and how insurance covers it — a drug-free path forward for depression.",
    tag: "TMS Therapy",
    variant: "blue",
    date: "2026-06-22",
    image: "/images/ep-tms.jpg",
    gradient: "linear-gradient(150deg,#123B52,#1D6E96)",
    youtubeUrl: CHANNEL,
    articleHref: "/blog/tms-therapy-drug-free-depression-treatment-san-antonio",
    status: "published",
    updatedAt: "2026-06-22T09:00:00.000Z",
  },
  {
    id: "ep-every-child",
    slug: "every-child-is-different",
    title: "Every Child Is Different. She Just Needed Someone to See That.",
    summary:
      "A mother shares her experience finding individualized psychiatric care for her children with different diagnoses.",
    tag: "Patient Story",
    variant: "violet",
    date: "2026-06-10",
    image: "/images/ep-every-child.jpg",
    gradient: "linear-gradient(150deg,#2AA8E8,#1C7FB4)",
    youtubeUrl: CHANNEL,
    status: "published",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "ep-what-makes-us-different",
    slug: "what-makes-graceland-different",
    title: "What Makes Graceland Psychiatry Different | Mental Health Care That Actually Helps",
    summary:
      "Graceland's evaluation process, personalized treatment planning, and family-centered philosophy across San Antonio.",
    tag: "About Us",
    variant: "blue",
    date: "2026-06-03",
    image: "/images/ep-what-makes-us-different.jpg",
    gradient: "linear-gradient(150deg,#0E4C74,#0A3350)",
    youtubeUrl: CHANNEL,
    status: "published",
    updatedAt: "2026-06-03T09:00:00.000Z",
  },
  {
    id: "ep-center-of-excellence",
    slug: "center-of-excellence-san-antonio",
    title: "Graceland Psychiatry — A Center of Excellence in San Antonio",
    summary:
      "Introducing Graceland's mission to deliver culturally sensitive, patient-centered mental health care.",
    tag: "About Us",
    variant: "blue",
    date: "2026-05-20",
    image: "/images/ep-do-you-need.jpg",
    gradient: "linear-gradient(150deg,#7FA9BE,#4C7C93)",
    youtubeUrl: CHANNEL,
    status: "published",
    updatedAt: "2026-05-20T09:00:00.000Z",
  },
];
