import type { Metadata } from "next";
import { draftMode } from "next/headers";
import BlogExplorer from "@/components/blog-explorer";
import CtaBand from "@/components/cta-band";
import Media from "@/components/media";
import NeuralField from "@/components/neural-field";
import { getPosts } from "@/lib/store";

/** Static by default; re-checks the content store at most once a minute.
 *  CMS saves also call revalidatePath, so editor changes appear immediately. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Expert-backed articles from Graceland Psychiatry & TMS Center on depression, anxiety, ADHD, OCD, PTSD and treatment-resistant conditions.",
};

export default async function BlogPage() {
  const { isEnabled } = await draftMode();
  const posts = await getPosts({ includeDrafts: isEnabled });

  return (
    <>
      <section className="hero">
        <Media className="hero-bg" src="/images/hero-brain.jpg" data-parallax="0.22" />
        <NeuralField />
        <div className="wrap">
          <h1>Blogs</h1>
          <p className="hero-lede">
            Explore expert-backed articles from Graceland Psychiatry &amp; TMS Center designed to
            help you understand your mind, discover effective treatments, and make confident
            decisions about your mental health.
          </p>
        </div>
      </section>

      <BlogExplorer posts={posts} />

      <CtaBand />
    </>
  );
}
