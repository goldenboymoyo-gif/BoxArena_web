import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LiveTicker } from "@/components/site/LiveTicker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BoxArena — The Home of Professional Boxing",
    template: "%s | BoxArena",
  },
  description:
    "BoxArena is the premium digital ecosystem for professional boxing. Watch live fights, buy tickets, explore champions, rankings, news and the biggest events in the sport.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full scroll-smooth dark`}
    >
      <body className="min-h-full bg-[#080808] text-white antialiased">
        <SiteHeader />
        <LiveTicker />
        <main className="flex min-h-screen flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
