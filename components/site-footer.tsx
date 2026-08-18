import Image from "next/image";
import Link from "next/link";
import { CONTACT, LOCATIONS } from "@/lib/site";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  YouTubeIcon,
} from "./icons";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <Image
                src="/images/graceland-logo-footer.svg"
                alt="Graceland Psychiatry & TMS Center"
                width={180}
                height={38}
                className="site-logo"
              />
            </Link>
            <p className="footer-about">
              Evidence-based treatment for depression, anxiety, ADHD, OCD, PTSD, Addiction,
              Schizophrenia and other mental health conditions.
            </p>
            <div className="socials">
              <a href="#" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="YouTube">
                <YouTubeIcon />
              </a>
              <a href="#" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer-list">
              <li className="footer-line">
                <PhoneIcon />
                <span>
                  Call/Text: <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
                  <br />
                  {CONTACT.phone} ext. {CONTACT.ext}
                  <br />
                  Fax: {CONTACT.fax}
                </span>
              </li>
              <li className="footer-line">
                <MailIcon />
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Locations</h4>
            <ul className="footer-list">
              {LOCATIONS.map((loc) => (
                <li className="footer-line" key={loc.street}>
                  <PinIcon />
                  <span>
                    {loc.street}
                    <br />
                    {loc.city}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul className="footer-list">
              <li>
                <Link href="/services">Services</Link>
              </li>
              <li>
                <Link href="/our-team">Our Team</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Graceland Psychiatry. All Rights Reserved.</span>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
