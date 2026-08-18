import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import Media from "@/components/media";
import NewsletterForm from "@/components/newsletter-form";
import { MailIcon, PlayIcon } from "@/components/icons";
import { tagClass } from "@/components/post-card";
import { PLATFORMS, episodeThumbnail } from "@/lib/episodes";
import { getEpisodes } from "@/lib/store";
import { DISCUSSION_TOPICS } from "@/lib/site";
import { formatDate } from "@/lib/posts";
import PlatformIcon from "@/components/platform-icon";
import TrackedLink from "@/components/tracked-link";

/** Static by default; re-checks the content store at most once a minute.
 *  CMS saves also call revalidatePath, so editor changes appear immediately. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Psychiatry Perspectives Podcast",
  description:
    "Psychiatry Perspectives with Dr. Femi Popoola — a video and podcast series on mental health, shaped by medicine, culture, and lived experience.",
};

export default async function PodcastPage() {
  const { isEnabled } = await draftMode();
  const episodes = await getEpisodes({ includeDrafts: isEnabled });
  const latest = episodes[0];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <div className="wrap-wide">
        <section className="pod-hero">
          <div className="pod-hero-copy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="pod-wordmark-img"
              src="/images/psychiatry perspectives.png"
              alt="Psychiatry Perspectives"
            />
            <h1>With Dr. Femi Popoola</h1>
            <p>
              Mental health from more than one angle. Evidence-based conversations shaped by
              medicine, culture, and lived experience. A video and podcast series from Graceland
              Psychiatry and TMS Center.
            </p>
            <p style={{ marginBottom: 22 }}>New episodes every Tuesday.</p>
            <a className="btn" href="#latest" style={{ background: "#fff", color: "var(--blue-600)" }}>
              <PlayIcon />
              Latest Episode
            </a>
          </div>
          <Media
            className="pod-hero-photo"
            src="/images/Cover art 2.1.5.png"
            alt="Dr. Femi Popoola"
            gradient="linear-gradient(160deg,#0B6FA8,#04405F)"
          />
        </section>
      </div>

      {/* ---------- Platforms ---------- */}
      <section className="wrap-wide section">
        <h2 style={{ marginBottom: 24 }}>Listen and Watch on your Favorite Platform</h2>
        <div className="platforms">
          {PLATFORMS.map((p) => (
            <a className="platform" href={p.href} key={p.name}>
              <span className="platform-icon" style={{ background: p.color }}>
                <PlatformIcon name={p.name} />
              </span>
              <span>
                <b>{p.name}</b>
                <span>{p.action}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- Latest episode ---------- */}
      {latest && (
      <section className="wrap-wide section-tight" id="latest">
        <div className="rule-title">
          <span>Latest Episode</span>
        </div>
        <div className="latest-episode" style={{ marginTop: 22 }}>
          <TrackedLink kind="episode" slug={latest.slug} href={latest.youtubeUrl} aria-label={latest.title}>
            <Media src={episodeThumbnail(latest)} gradient={latest.gradient} />
          </TrackedLink>
          <div>
            <span className={tagClass(latest.variant)}>{latest.tag}</span>
            <h2 style={{ marginTop: 12 }}>{latest.title}</h2>
            <p style={{ fontSize: ".92rem" }}>{latest.summary}</p>
            <p className="meta">
              <time dateTime={latest.date}>{formatDate(latest.date)}</time>
              <span>·</span>
              <span>Dr. Femi Popoola, MD</span>
            </p>
            {latest.note && (
              <div className="note-box">
                <strong>Note:</strong> {latest.note}
              </div>
            )}
            <div className="ep-actions">
              <TrackedLink kind="episode" slug={latest.slug} className="btn btn-primary" href={latest.youtubeUrl}>
                <PlayIcon />
                Watch Now
              </TrackedLink>
              {latest.listenUrl && (
                <TrackedLink kind="episode" slug={latest.slug} className="btn btn-outline" href={latest.listenUrl}>
                  🎧 Listen
                </TrackedLink>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ---------- All episodes ---------- */}
      <section className="wrap-wide section">
        <div className="rule-title">
          <span>Psychiatry Perspectives</span>
        </div>
        <div className="section-title" style={{ marginBottom: 26 }}>
          <h2 style={{ color: "var(--blue-600)" }}>All Episodes</h2>
          <a
            className="link-arrow"
            href="https://www.youtube.com/@gracelandpsychiatry"
            style={{ color: "var(--body)" }}
          >
            View Channel ↗
          </a>
        </div>

        <div className="ep-grid">
          {episodes.map((ep) => (
            <article className="ep-card" key={ep.slug}>
              <TrackedLink
                kind="episode"
                slug={ep.slug}
                href={ep.youtubeUrl}
                aria-label={`Watch ${ep.title} on YouTube`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Media src={episodeThumbnail(ep)} gradient={ep.gradient} />
              </TrackedLink>
              <div className="ep-body">
                <div className="ep-head">
                  <span className={tagClass(ep.variant)}>{ep.tag}</span>
                  <time dateTime={ep.date}>{formatDate(ep.date)}</time>
                </div>
                <h3>
                  <TrackedLink
                    kind="episode"
                    slug={ep.slug}
                    href={ep.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ep.title}
                  </TrackedLink>
                </h3>
                <p>{ep.summary}</p>
                <div className="ep-card-actions">
                  <TrackedLink
                    kind="episode"
                    slug={ep.slug}
                    className="watch-link"
                    href={ep.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ▶ Watch on YouTube
                  </TrackedLink>
                  {ep.articleHref && (
                    <Link className="watch-link watch-link--article" href={ep.articleHref}>
                      Read Article →
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="section-tight">
          <h2 style={{ fontSize: "1.35rem" }}>We Discuss</h2>
          <div className="topics">
            {DISCUSSION_TOPICS.map((topic) => (
              <Link className="topic" href="/blog" key={topic}>
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Meet the host ---------- */}
      <section className="host-band wrap section">
        <div className="host-inner">
          <Media
            src="/images/ImageWithFallback dr femi image.png"
            alt="Dr. Femi Popoola"
            gradient="linear-gradient(160deg,#17506B,#0A2A3C)"
          />
          <div className="host-copy">
            <h2>Meet Dr. Femi Popoola</h2>
            <p>
              Dr. Femi Popoola is a board-certified general psychiatrist and child and adolescent
              psychiatrist. He is the founder of Graceland Psychiatry and TMS Center, with clinics
              in San Antonio, Texas; New Braunfels, Texas; and Columbia, Missouri. He earned his
              medical degree from the University of Ilorin in Nigeria and completed psychiatry
              residency at the University of Missouri (Mizzou). He served four years on active
              duty in the United States Navy, including service aboard the USS Gravely. He is also
              the founder of Mastermind Recovery, pastor of New Testament Christian Mission San
              Antonio, and host of the Mental Health Insights podcast.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Stay in the loop ---------- */}
      <section className="loop">
        <div className="wrap">
          <div className="loop-icon">
            <MailIcon width={20} height={20} />
          </div>
          <h2 style={{ fontSize: "1.5rem" }}>Stay in the Loop</h2>
          <p>New episodes, mental health resources, and practice updates straight to your inbox.</p>
          <NewsletterForm id="nl-podcast" idleNote="No spam. Unsubscribe anytime." />
        </div>
      </section>
    </>
  );
}
