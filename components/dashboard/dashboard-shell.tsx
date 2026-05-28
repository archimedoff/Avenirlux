"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon?: string };

type Props = {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: ReactNode;
  badge?: string;
};

export function DashboardShell({ title, subtitle, nav, children, badge }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <Link href="/" className="font-display text-lg font-medium tracking-[-0.03em]">
            AvenirLux
          </Link>
          {badge && <span className="dash-sidebar-badge">{badge}</span>}
        </div>
        <nav className="dash-sidebar-nav">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link key={item.href} href={item.href} className={`dash-nav-link ${active ? "dash-nav-link--active" : ""}`}>
                {item.icon && <span className="dash-nav-icon" aria-hidden>{item.icon}</span>}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="dash-sidebar-footer">
          <p className="truncate text-xs text-[var(--foreground-muted)]">{session?.user?.email}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/" className="text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              ← Back to site
            </Link>
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">{title}</h1>
            {subtitle && <p className="dash-subtitle">{subtitle}</p>}
          </div>
        </header>
        <div className="dash-content page-enter">{children}</div>
      </div>
    </div>
  );
}
