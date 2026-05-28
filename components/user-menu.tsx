"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { useAuthModal } from "@/components/auth/auth-modal-provider";

function initials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  }
  return email?.[0]?.toUpperCase() || "A";
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const { openAuth } = useAuthModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-muted)]" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => openAuth("signin")} className="btn-ghost hidden text-[0.8125rem] sm:inline-flex">
          Sign in
        </button>
        <button type="button" onClick={() => openAuth("signup")} className="btn-primary text-[0.8125rem] !py-2 !px-4">
          Join
        </button>
      </div>
    );
  }

  const label = session.user.name || session.user.email || "Member";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-xs font-semibold text-white shadow-[var(--shadow-sm)] transition-transform duration-300 hover:scale-105"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initials(session.user.name, session.user.email)}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-lg)]">
          <p className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">{label}</p>
          {session.user.role === "host" || session.user.role === "admin" ? (
            <Link href="/host" className="block px-4 py-2.5 text-sm text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]" onClick={() => setOpen(false)}>
              Host studio
            </Link>
          ) : null}
          {session.user.role === "admin" ? (
            <Link href="/admin" className="block px-4 py-2.5 text-sm text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]" onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          <Link href="/account" className="block px-4 py-2.5 text-sm text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]" onClick={() => setOpen(false)}>
            Your account
          </Link>
          <button
            type="button"
            className="block w-full px-4 py-2.5 text-left text-sm text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
