"use client";

import { useEffect } from "react";

import { AuthPanelBody } from "@/components/auth/auth-panel-body";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import type { SocialProviderMeta } from "@/lib/auth/social-types";

type AuthMode = "signin" | "signup";

type Props = {
  open: boolean;
  mode: AuthMode;
  providers: SocialProviderMeta[];
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({ open, mode, providers, onClose, onModeChange }: Props) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button type="button" className="absolute inset-0 bg-[var(--luxury-ink)]/55 backdrop-blur-md transition-opacity duration-300" aria-label="Close" onClick={onClose} />
      <div className="auth-panel page-enter relative z-[1] w-full max-w-md overflow-hidden rounded-t-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-float)] sm:rounded-[var(--radius-card)]">
        <div className="auth-panel-shine pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">AvenirLux</p>
              <h2 id="auth-modal-title" className="font-display mt-2 text-2xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)]">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="btn-icon !h-9 !w-9" aria-label="Close">
              ×
            </button>
          </div>
          <div className="mb-6 flex rounded-full bg-[var(--surface-muted)] p-1">
            <button
              type="button"
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 ${mode === "signin" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-muted)]"}`}
              onClick={() => onModeChange("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 ${mode === "signup" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-muted)]"}`}
              onClick={() => onModeChange("signup")}
            >
              Sign up
            </button>
          </div>
          <AuthPanelBody mode={mode} providers={providers} callbackUrl="/account" onSuccess={onClose} onModeChange={onModeChange} />
        </div>
      </div>
    </div>
  );
}
