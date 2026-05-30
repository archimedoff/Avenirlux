import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-[var(--container)] flex-col gap-12 px-4 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="group inline-flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="font-display text-xl font-medium tracking-[-0.02em] text-[var(--foreground)] transition-opacity duration-300 group-hover:opacity-75">
              AvenirLux
            </span>
          </Link>
          <p className="mt-5 text-[0.875rem] leading-[1.75] text-[var(--foreground-muted)]">
            Quiet luxury travel — cinematic stays, European restraint, and spaces meant to be remembered.
          </p>
          <p className="mt-4 eyebrow eyebrow-gold">Est. for the discerning traveler</p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
          <nav className="flex flex-col gap-3" aria-label="Explore">
            <p className="eyebrow">Explore</p>
            <Link href="/" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Home</Link>
            <Link href="/hotels" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Stays</Link>
            <Link href="/concierge" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Concierge</Link>
          </nav>
          <nav className="flex flex-col gap-3" aria-label="Host">
            <p className="eyebrow">Host</p>
            <Link href="/list-property" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">List property</Link>
            <Link href="/host" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Host studio</Link>
          </nav>
          <nav className="flex flex-col gap-3" aria-label="Account">
            <p className="eyebrow">Account</p>
            <Link href="/account" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Your stays</Link>
            <Link href="/auth" className="text-[0.875rem] text-[var(--foreground-muted)] transition-colors duration-300 hover:text-[var(--foreground)]">Sign in</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <p className="mx-auto max-w-[var(--container)] px-4 py-6 text-center text-[0.6875rem] tracking-[0.08em] text-[var(--foreground-subtle)] sm:px-6 sm:text-left lg:px-8">
          © {new Date().getFullYear()} AvenirLux. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
