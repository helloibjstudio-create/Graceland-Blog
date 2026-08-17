import { draftMode } from "next/headers";
import DraftBanner from "@/components/draft-banner";
import ParallaxProvider from "@/components/parallax-provider";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isEnabled } = await draftMode();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ParallaxProvider />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      {isEnabled && <DraftBanner />}
    </>
  );
}
