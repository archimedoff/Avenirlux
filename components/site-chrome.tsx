"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ConciergeShell } from "@/components/concierge/concierge-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isDashboardRoute } from "@/lib/navigation";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboard = isDashboardRoute(pathname);
  const isHome = pathname === "/";

  if (dashboard) {
    return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div
        id="main-content"
        className={`mx-auto w-full flex-1 ${isHome ? "" : "max-w-[var(--container)] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-5 lg:px-8"}`}
      >
        {children}
      </div>
      <SiteFooter />
      <ConciergeShell />
    </>
  );
}
