"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isDashboardRoute } from "@/lib/navigation";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboard = isDashboardRoute(pathname);

  if (dashboard) {
    return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div id="main-content" className="mx-auto w-full max-w-[var(--container)] flex-1 px-4 pb-16 pt-3 sm:px-6 sm:pb-20 sm:pt-4 lg:px-8 lg:pt-5">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
