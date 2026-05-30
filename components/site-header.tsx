"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { LanguageSwitcher } from "@/components/locale/language-switcher";
import { UserMenu } from "@/components/user-menu";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { useTranslations } from "@/lib/i18n/use-translations";
import { isDashboardRoute } from "@/lib/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openAuth } = useAuthModal();
  const { t: tNav } = useTranslations("nav");
  const { t: tCommon } = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const nav = useMemo(
    () => [
      { href: "/", label: tNav("explore") },
      { href: "/hotels", label: tNav("hotels") },
      { href: "/concierge", label: tNav("concierge") },
    ],
    [tNav],
  );

  useBodyScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isDashboardRoute(pathname)) {
    return null;
  }

  const role = session?.user?.role;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled ? "glass-header-scrolled border-[var(--border)]" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[var(--container)] items-center justify-between gap-4 px-4 sm:h-[3.75rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-[var(--foreground)] transition-opacity duration-300 hover:opacity-80"
        >
          <BrandMark className="transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
          <span className="font-display text-base font-medium tracking-[-0.02em] sm:text-[1.0625rem]">
            {tCommon("brand")}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-[0.02em] transition-[color,background-color] duration-300 ${
                  active
                    ? "text-[var(--luxury-gold)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-[var(--luxury-gold)] opacity-60" aria-hidden />
                )}
              </Link>
            );
          })}
          {session?.user && (
            <Link
              href="/account"
              className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-[0.02em] transition-colors duration-300 ${
                pathname.startsWith("/account")
                  ? "text-[var(--luxury-gold)]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tCommon("account")}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href="/list-property" className="btn-secondary text-[0.75rem] !px-4 !py-2">
            {tNav("listProperty")}
          </Link>
          <UserMenu />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <UserMenu />
          <button
            type="button"
            className="btn-icon"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? tCommon("menuClose") : tCommon("menuOpen")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`min-h-0 overflow-hidden border-t border-[var(--border)] bg-[var(--surface-elevated)]/98 backdrop-blur-2xl transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          open ? "max-h-[min(32rem,85dvh)] opacity-100" : "max-h-0 opacity-0 border-t-transparent"
        }`}
      >
        <nav className="flex min-h-0 flex-col gap-0.5 overflow-y-auto px-4 py-5" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium text-[var(--foreground)] transition-colors duration-300 hover:bg-white/[0.04] active:scale-[0.99]"
            >
              {item.label}
            </Link>
          ))}
          {session?.user && (
            <Link href="/account" className="rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium text-[var(--foreground)] hover:bg-white/[0.04]">
              {tCommon("account")}
            </Link>
          )}
          <Link href="/list-property" className="rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium text-[var(--foreground)] hover:bg-white/[0.04]">
            {tNav("listProperty")}
          </Link>
          {(role === "host" || role === "admin") && (
            <Link href="/host" className="rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium text-[var(--foreground)] hover:bg-white/[0.04]">
              {tCommon("hostStudio")}
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className="rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium text-[var(--foreground)] hover:bg-white/[0.04]">
              {tCommon("admin")}
            </Link>
          )}
          {!session?.user && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openAuth("signin")} className="btn-secondary w-full text-[0.875rem]">
                {tNav("signIn")}
              </button>
              <button type="button" onClick={() => openAuth("signup")} className="btn-primary w-full text-[0.875rem]">
                {tNav("join")}
              </button>
            </div>
          )}
          <Link href="/hotels" className="btn-primary mt-3 text-center text-[0.875rem]">
            {tCommon("bookStay")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
