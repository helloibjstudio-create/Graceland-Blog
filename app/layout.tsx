import type { Metadata } from "next";
import localFont from "next/font/local";
import { Archivo } from "next/font/google";
import "./globals.css";

// Mona-Sans variable font — covers Light through Black, Normal width
const monaSans = localFont({
  src: [
    {
      path: "../public/images/mona-sans/Mona-Sans.ttf",
      weight: "200 900",
      style: "normal",
    },
  ],
  variable: "--font-mona",
  display: "swap",
});

// Mona-Sans SemiBold Wide — used specifically for hero H1 titles
const monaSansWide = localFont({
  src: [
    {
      path: "../public/images/mona-sans/Mona-Sans-SemiBoldWide.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-mona-wide",
  display: "swap",
});

// Archivo — captions, subtitles, body text
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gracelandpsychiatry.com"),
  title: {
    default: "Graceland Psychiatry & TMS Center",
    template: "%s | Graceland Psychiatry & TMS Center",
  },
  description:
    "Evidence-based treatment for depression, anxiety, ADHD, OCD, PTSD and treatment-resistant conditions across San Antonio, New Braunfels and Columbia, MO.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${monaSansWide.variable} ${archivo.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
