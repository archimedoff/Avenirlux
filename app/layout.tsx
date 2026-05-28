import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "AvenirLux — Quiet luxury hotels",
    template: "%s · AvenirLux",
  },
  description:
    "Curated cinematic stays across the world's most considered destinations. Ultra-premium hospitality, privately selected.",
  applicationName: "AvenirLux",
  keywords: ["AvenirLux", "luxury hotels", "boutique stays", "quiet luxury travel"],
  openGraph: {
    title: "AvenirLux",
    description:
      "Curated cinematic stays across the world's most considered destinations. Ultra-premium hospitality, privately selected.",
    siteName: "AvenirLux",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AvenirLux",
    description:
      "Curated cinematic stays across the world's most considered destinations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className={`${plusJakarta.className} flex min-h-screen flex-col antialiased`}>
        <AppProviders>
        <SiteHeader />
        <div className="mx-auto w-full max-w-[var(--container)] flex-1 px-4 pb-16 pt-3 sm:px-6 sm:pb-20 sm:pt-4 lg:px-8 lg:pt-5">
          {children}
        </div>
        <footer className="site-footer mt-auto border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-[var(--container)] flex-col gap-10 px-4 py-11 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-14 lg:px-8">
            <div className="max-w-xs">
              <Link href="/" className="group inline-flex items-center gap-3">
                <BrandMark size="sm" />
                <span className="font-display text-lg font-medium tracking-[-0.03em] text-stone-100 transition-opacity duration-300 group-hover:opacity-85">
                  AvenirLux
                </span>
              </Link>
              <p className="mt-4 text-[0.8125rem] leading-[1.7] text-stone-500">
                Quiet luxury travel — cinematic stays, European restraint, and spaces meant to be remembered.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-10 gap-y-3 text-[0.8125rem] font-medium tracking-[-0.01em] text-stone-500" aria-label="Footer">
              <Link href="/" className="transition-colors duration-300 hover:text-stone-300">
                Explore
              </Link>
              <Link href="/hotels" className="transition-colors duration-300 hover:text-stone-300">
                Stays
              </Link>
            </nav>
          </div>
          <div className="border-t border-white/[0.04]">
            <p className="mx-auto max-w-[var(--container)] px-4 py-5 text-center text-[0.6875rem] tracking-[0.02em] text-stone-600 sm:px-6 sm:text-left lg:px-8">
              © {new Date().getFullYear()} AvenirLux. All rights reserved.
            </p>
          </div>
        </footer>
              </AppProviders>
      </body>
    </html>
  );
}
