import type { Author, AuthorId, Post } from "./types";

export type { Post, Author, AuthorId, TagVariant } from "./types";

export const AUTHORS: Record<AuthorId, Author> = {
  popoola: {
    id: "popoola",
    name: "Dr. Femi Popoola",
    initials: "FP",
    role: "Founder & Medical Director, Graceland Psychiatry",
  },
  team: {
    id: "team",
    name: "Graceland Psychiatry",
    initials: "GP",
    role: "Clinical Team",
  },
};

export const TOPIC_FILTERS = [
  { value: "all", label: "All topics" },
  { value: "tms", label: "TMS Therapy" },
  { value: "depression", label: "Depression" },
  { value: "anxiety", label: "Anxiety" },
  { value: "child", label: "Child Psychiatry" },
  { value: "wellness", label: "Mental Wellness" },
  { value: "spravato", label: "Spravato" },
  { value: "adhd", label: "ADHD" },
];

export const DATE_FILTERS = [
  { value: "all", label: "Any time" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "365", label: "Last year" },
];

export const AUTHOR_FILTERS = [
  { value: "all", label: "All authors" },
  { value: "popoola", label: "Dr. Femi Popoola" },
  { value: "team", label: "Graceland Psychiatry" },
];

export const TAG_VARIANTS = ["blue", "green", "violet", "amber", "rose"] as const;

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatLongDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Seed content — written to data/content.json the first time the store runs. */
export const SEED_POSTS: Post[] = [
  {
    id: "post-tms",
    slug: "tms-therapy-drug-free-depression-treatment-san-antonio",
    title: "TMS Therapy: The Drug-Free Depression Treatment Changing Lives in San Antonio",
    excerpt:
      "Transcranial Magnetic Stimulation is transforming how we treat major depressive disorder. Dr. Femi Popoola explains who it's right for, what to expect during treatment, and the neuroscience behind why it works when medications have failed.",
    body: "",
    topic: "tms",
    tag: "TMS Therapy",
    variant: "blue",
    author: "popoola",
    date: "2026-07-10",
    readTime: 8,
    image: "/images/hero-brain.jpg",
    status: "published",
    featured: true,
    episodeUrl: "/podcast",
    updatedAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "post-spravato",
    slug: "spravato-fda-approved-nasal-spray-depression",
    title: "Spravato: The FDA-Approved Nasal Spray That Can Lift Depression in Hours",
    excerpt:
      "Esketamine works on a completely different pathway than traditional antidepressants — and for some patients, relief arrives in hours rather than weeks.",
    body: "## A different pathway\n\nMost antidepressants act on serotonin, norepinephrine or dopamine, and they take four to eight weeks to show their full effect. Esketamine — the active ingredient in Spravato — works on the glutamate system instead, and that difference is why relief can arrive so much faster.\n\n## Who it is for\n\nSpravato is indicated for adults with treatment-resistant depression and for depressive symptoms in adults with major depressive disorder and acute suicidal ideation or behaviour.\n\n- You have tried at least two antidepressants without adequate relief\n- You need faster relief than a standard medication trial allows\n- You can attend a certified treatment centre for monitored dosing\n\n## What a session looks like\n\nSpravato is self-administered as a nasal spray under supervision at a certified REMS centre. You stay for two hours of monitoring afterwards, and you will need a ride home.\n\n> Patients often describe the first session as the first time in months that the weight lifted — even briefly.\n\nTalk to our team about whether Spravato belongs in your treatment plan.",
    topic: "spravato",
    tag: "Spravato",
    variant: "green",
    author: "popoola",
    date: "2026-07-07",
    readTime: 6,
    image: "/images/spravato.jpg",
    status: "published",
    episodeUrl: "/podcast",
    updatedAt: "2026-07-07T09:00:00.000Z",
  },
  {
    id: "post-adhd-women",
    slug: "adhd-in-women-and-girls-undiagnosed",
    title: "ADHD in Women and Girls: Why It Goes Undiagnosed for Decades",
    excerpt:
      "Inattentive-type ADHD rarely looks like the hyperactive boy in the classroom. Here is what it actually looks like — and why so many women reach adulthood without a diagnosis.",
    body: "",
    topic: "adhd",
    tag: "ADHD",
    variant: "violet",
    author: "popoola",
    date: "2026-07-03",
    readTime: 7,
    image: "/images/adhd-women.jpg",
    status: "published",
    updatedAt: "2026-07-03T09:00:00.000Z",
  },
  {
    id: "post-first-appointment",
    slug: "what-to-expect-first-psychiatry-appointment",
    title: "What to Expect at Your First Psychiatry Appointment",
    excerpt:
      "Seeing a psychiatrist for the first time can feel overwhelming. We walk you through exactly what happens, what to bring, and the questions worth asking.",
    body: "",
    topic: "wellness",
    tag: "Mental Wellness",
    variant: "blue",
    author: "team",
    date: "2026-06-28",
    readTime: 6,
    image: "/images/first-appointment.jpg",
    status: "published",
    updatedAt: "2026-06-28T09:00:00.000Z",
  },
  {
    id: "post-sleep",
    slug: "sleep-and-mental-health-connection",
    title: "The Sleep and Mental Health Connection: What Your Brain Does While You Rest",
    excerpt:
      "Poor sleep does not just leave you fatigued. It actively reshapes emotional regulation and raises your risk for mood and anxiety disorders.",
    body: "",
    topic: "wellness",
    tag: "Mental Wellness",
    variant: "blue",
    author: "popoola",
    date: "2026-06-22",
    readTime: 9,
    image: "/images/sleep.jpg",
    status: "published",
    updatedAt: "2026-06-22T09:00:00.000Z",
  },
  {
    id: "post-gad",
    slug: "generalized-anxiety-disorder-beyond-worry",
    title: "When Anxiety Goes Beyond Worry: Recognizing Generalized Anxiety Disorder",
    excerpt:
      "Almost everyone worries sometimes. But when anxiety becomes relentless and physically exhausting, it is time to look at what is really going on.",
    body: "",
    topic: "anxiety",
    tag: "Anxiety",
    variant: "amber",
    author: "popoola",
    date: "2026-06-16",
    readTime: 7,
    image: "/images/anxiety.jpg",
    status: "published",
    updatedAt: "2026-06-16T09:00:00.000Z",
  },
  {
    id: "post-resilient-kids",
    slug: "raising-emotionally-resilient-kids",
    title: "Raising Emotionally Resilient Kids: A Child Psychiatrist's Practical Guide",
    excerpt:
      "Emotional resilience is a skill, not a trait children are born with. Dr. Popoola shares research-backed strategies families can start using today.",
    body: "",
    topic: "child",
    tag: "Child Psychiatry",
    variant: "blue",
    author: "popoola",
    date: "2026-06-04",
    readTime: 10,
    image: "/images/resilient-kids.jpg",
    status: "published",
    updatedAt: "2026-06-04T09:00:00.000Z",
  },
  {
    id: "post-trd",
    slug: "treatment-resistant-depression-medication-stopped-working",
    title: "Treatment-Resistant Depression: Why Your Medication Stopped Working",
    excerpt:
      "Up to a third of people with depression do not respond adequately to standard antidepressants. Dr. Popoola explains what comes next.",
    body: "",
    topic: "depression",
    tag: "Depression",
    variant: "rose",
    author: "popoola",
    date: "2026-05-30",
    readTime: 8,
    image: "/images/trd.jpg",
    status: "published",
    updatedAt: "2026-05-30T09:00:00.000Z",
  },
  {
    id: "post-talking-child",
    slug: "talking-to-your-child-about-mental-health",
    title: "Talking to Your Child About Mental Health: An Age-by-Age Guide",
    excerpt:
      "When and how do you discuss depression, anxiety, or therapy with your kids? A child psychiatrist gives parents the words to use.",
    body: "",
    topic: "child",
    tag: "Child Psychiatry",
    variant: "blue",
    author: "popoola",
    date: "2026-05-20",
    readTime: 8,
    image: "/images/talking-child.jpg",
    status: "published",
    updatedAt: "2026-05-20T09:00:00.000Z",
  },
];
