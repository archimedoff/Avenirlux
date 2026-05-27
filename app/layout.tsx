import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";

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
  title: "LuxeStay | Hotel Booking",
  description: "Find premium stays worldwide with a modern booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className={`${plusJakarta.className} flex min-h-screen flex-col antialiased`}>
        <SiteHeader />
        <div className="mx-auto w-full max-w-[var(--container)] flex-1 px-4 pb-16 pt-3 sm:px-6 sm:pb-20 sm:pt-4 lg:px-8 lg:pt-5">
          {children}
        </div>
        <footer className="site-footer mt-auto border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-[var(--container)] flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-12 lg:px-8">
            <div>
              <p className="font-display text-lg tracking-tight text-stone-200">LuxeStay</p>
              <p className="mt-2 max-w-[14rem] text-xs leading-relaxed text-stone-500">
                A quiet way to book exceptional hotels.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-stone-500" aria-label="Footer">
              <Link href="/" className="transition-colors hover:text-stone-300">
                Home
              </Link>
              <Link href="/hotels" className="transition-colors hover:text-stone-300">
                Stays
              </Link>
            </nav>
          </div>
          <div className="border-t border-white/[0.04]">
            <p className="mx-auto max-w-[var(--container)] px-4 py-5 text-center text-[0.6875rem] text-stone-600 sm:px-6 sm:text-left lg:px-8">
              © {new Date().getFullYear()} LuxeStay
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
