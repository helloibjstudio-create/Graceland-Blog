import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
    <html lang="en" className={jakarta.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
