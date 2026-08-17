import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import ArticleAside from "@/components/article-aside";
import CtaBand from "@/components/cta-band";
import Media from "@/components/media";
import NeuralField from "@/components/neural-field";
import PostCard from "@/components/post-card";
import ReadingProgress from "@/components/reading-progress";
import { ArrowRight, PlayIcon } from "@/components/icons";
import { ARTICLE_BODIES } from "@/content";
import { renderMarkdown } from "@/lib/markdown";
import { AUTHORS, formatLongDate } from "@/lib/posts";
import { getPostBySlug, getPosts } from "@/lib/store";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    robots: post.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled: isDraftMode } = await draftMode();

  const post = await getPostBySlug(slug, { includeDrafts: isDraftMode });
  if (!post) notFound();

  const author = AUTHORS[post.author];
  const coded = ARTICLE_BODIES[post.slug];
  const markdown = post.body.trim() ? renderMarkdown(post.body) : null;

  // CMS markdown wins; otherwise fall back to the hand-coded article component.
  const toc = markdown ? markdown.toc : (coded?.toc ?? []);
  const CodedBody = !markdown ? coded?.Body : undefined;

  const allPosts = await getPosts({ includeDrafts: isDraftMode });
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <ReadingProgress />

      <section className="hero article-hero">
        <Media className="hero-bg" src={post.image} data-parallax="0.22" />
        <NeuralField />
        <div className="wrap">
          <div className="tag-row">
            {post.status === "draft" ? (
              <span className="tag tag-amber">Draft</span>
            ) : (
              <span className="tag tag-new">NEW</span>
            )}
            <span className="tag tag-glass">{post.tag}</span>
          </div>
          <h1>{post.title}</h1>
          {post.episodeUrl && (
            <Link className="btn btn-primary" href={post.episodeUrl}>
              <PlayIcon />
              Listen to the Episode
            </Link>
          )}
        </div>
      </section>

      <div className="article-shell">
        <div className="wrap">
          <div className="article-card">
            <div className="article-topbar">
              <div className="byline">
                <span className="avatar avatar-lg">{author.initials}</span>
                <span>
                  <span className="byline-name">
                    {author.name}
                    {author.id === "popoola" ? ", MD, MS" : ""}
                  </span>
                  <span className="byline-meta">{author.role}</span>
                </span>
              </div>
              <div className="meta">
                <time dateTime={post.date}>{formatLongDate(post.date)}</time>
                <span>·</span>
                <span>{post.readTime} min read</span>
              </div>
            </div>

            <div className="article-layout">
              <ArticleAside items={toc} />

              <article className="prose">
                {markdown ? (
                  <div dangerouslySetInnerHTML={{ __html: markdown.html }} />
                ) : CodedBody ? (
                  <CodedBody />
                ) : (
                  <>
                    <p className="lede">{post.excerpt}</p>
                    <div className="note-box">
                      The full write-up for this article is being prepared by our clinical team. In
                      the meantime, <Link href="/contact">reach out</Link> with any questions — or
                      browse the <Link href="/podcast">podcast</Link> for related conversations.
                    </div>
                  </>
                )}

                <div className="author-card">
                  <span className="avatar avatar-lg">{author.initials}</span>
                  <div>
                    <span className="eyebrow">Written by</span>
                    <h3>
                      {author.name}
                      {author.id === "popoola" ? ", MD, MS" : ""}
                    </h3>
                    <p>
                      {author.id === "popoola" ? (
                        <>
                          Founder &amp; Medical Director, Graceland Psychiatry. Double
                          board-certified in General and Child &amp; Adolescent Psychiatry, Dr.
                          Popoola is the founder of Graceland Psychiatry &amp; TMS Center, with
                          clinics across San Antonio, New Braunfels and Columbia, Missouri. He is a
                          US Navy veteran and host of the{" "}
                          <Link href="/podcast">Psychiatry Perspectives</Link> podcast.
                        </>
                      ) : (
                        <>
                          The clinical team at Graceland Psychiatry &amp; TMS Center — psychiatrists,
                          nurse practitioners and therapists serving San Antonio, New Braunfels and
                          Columbia, Missouri.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>

      <section className="related">
        <div className="wrap">
          <div className="section-title" style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: "1.5rem" }}>Continue Reading</h2>
            <Link className="link-arrow" href="/blog" style={{ color: "var(--blue-600)" }}>
              All Posts <ArrowRight />
            </Link>
          </div>
          <div className="card-grid">
            {related.map((item) => (
              <PostCard post={item} key={item.slug} compact />
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
