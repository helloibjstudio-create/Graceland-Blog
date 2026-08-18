import Link from "next/link";
import { CONTACT } from "@/lib/site";

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="wrap">
        <span className="eyebrow">Take the first step</span>
        <h2>Ready to take the first step towards improved mental well-being?</h2>
        <p>We&rsquo;re here to help you on your journey.</p>
        <Link className="btn btn-primary btn-book" href="/contact">
          Book an Appointment
        </Link>
        <p className="cta-note">
          Or call/text us directly at <strong>{CONTACT.phone}</strong>
        </p>
      </div>
    </section>
  );
}
