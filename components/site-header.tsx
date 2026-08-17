"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "./icons";

const RESOURCES = [
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcast" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);   // Resources dropdown
  const [navOpen, setNavOpen] = useState(false);     // mobile drawer
  const [solid, setSolid] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);

  /* The podcast page sits on a light background, so the header is opaque there. */
  const lightPage = pathname?.startsWith("/podcast") ?? false;
  const resourcesActive = RESOURCES.some((r) => pathname?.startsWith(r.href));

  useEffect(() => {
    if (lightPage) return;
    const onScroll = () => setSolid(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lightPage]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNavOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* Close everything on route change. */
  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
  }, [pathname]);

  const isDesktop = () =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 961px)").matches;

  const headerClass = [
    "site-header",
    lightPage ? "is-light" : "",
    !lightPage && solid ? "is-solid" : "",
    navOpen ? "nav-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="wrap-wide">
        <nav className="nav-shell" aria-label="Main navigation">
          <Link className="brand" href="/">
            <Image
              src="/images/graceland-logo.svg"
              alt="Graceland Psychiatry & TMS Center"
              width={180}
              height={38}
              className="site-logo"
              priority
            />
          </Link>

          <ul className="nav-links">
            <li>
              <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/our-team">Our Team</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>

            <li
              className={`nav-item-has-menu${menuOpen ? " is-open" : ""}`}
              ref={itemRef}
              onMouseEnter={() => isDesktop() && setMenuOpen(true)}
              onMouseLeave={() => isDesktop() && setMenuOpen(false)}
            >
              <button
                type="button"
                className="nav-toggle-link"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="resources-menu"
                data-active={resourcesActive || undefined}
                onClick={() => setMenuOpen((v) => !v)}
              >
                Resources
                <ChevronDown />
              </button>

              <div className="dropdown" id="resources-menu">
                <p className="dropdown-label">Learn &amp; Explore</p>
                <ul className="dropdown-list">
                  {RESOURCES.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={pathname?.startsWith(item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>

            {/* Shown inside the drawer on small screens, where the pill button has no room. */}
            <li className="nav-cta-mobile">
              <a className="btn btn-outline btn-block" href="https://patientportal.example.com">
                Patient Portal
              </a>
            </li>
          </ul>

          <a className="nav-cta" href="https://patientportal.example.com">
            Patient Portal
          </a>

          <button
            type="button"
            className="burger"
            aria-label="Toggle menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
          </button>
        </nav>
      </div>
    </header>
  );
}
