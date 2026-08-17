import Link from "next/link";
import CtaBand from "@/components/cta-band";
import Media from "@/components/media";
import NeuralField from "@/components/neural-field";
import PostCard from "@/components/post-card";
import Reveal from "@/components/reveal";
import { ArrowRight } from "@/components/icons";
import { getPosts } from "@/lib/store";

export const revalidate = 60;

const SERVICES = [
  { title: "TMS Therapy", body: "Drug-free, FDA-cleared brain stimulation for treatment-resistant depression." },
  { title: "Spravato", body: "Esketamine treatment that can lift depression in hours, not weeks." },
  { title: "Child & Adolescent", body: "Specialist psychiatric care for children, teens and their families." },
  { title: "Medication Management", body: "Careful, personalized prescribing with real follow-through." },
];

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <>
      <section className="hero" data-parallax-scene>
        <Media className="hero-bg" src="/images/hero-brain.jpg" data-parallax="0.25" />
        <NeuralField />
        <div className="wrap">
          <Reveal>
            <span className="eyebrow" style={{ color: "#79D0F7" }}>
              San Antonio · New Braunfels · Columbia, MO
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1>Mental health care that actually helps.</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero-lede">
              Evidence-based treatment for depression, anxiety, ADHD, OCD, PTSD and
              treatment-resistant conditions — from a team that takes the time to understand you.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <Link className="btn btn-primary" href="/contact">
              Book an Appointment <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="wrap section">
        <Reveal>
          <h2>What we treat</h2>
        </Reveal>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 26 }}>
          {SERVICES.map((service, i) => (
            <Reveal delay={i * 90} key={service.title}>
              <article className="step" style={{ display: "block", height: "100%" }}>
                <h4>{service.title}</h4>
                <p>{service.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-title" style={{ marginBottom: 26 }}>
          <h2>From the blog</h2>
          <Link className="link-arrow" href="/blog" style={{ color: "var(--blue-600)" }}>
            All articles <ArrowRight />
          </Link>
        </div>
        <div className="card-grid">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal delay={i * 90} key={post.slug}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
