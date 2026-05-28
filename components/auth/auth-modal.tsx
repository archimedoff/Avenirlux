"use client";

import { useEffect } from "react";

import { AuthPanelBody } from "@/components/auth/auth-panel-body";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import type { SocialProviderState } from "@/lib/auth/social-types";

type AuthMode = "signin" | "signup";

type Props = {
  open: boolean;
  mode: AuthMode;
  providers: SocialProviderState[];
  providersLoading?: boolean;
  providersError?: string | null;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({
  open,
  mode,
  providers,
  providersLoading,
  providersError,
  onClose,
  onModeChange,
}: Props) {
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
    <div
      className="auth-modal-root fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="auth-modal-backdrop absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="auth-modal-panel page-enter relative z-[1] w-full max-w-md overflow-hidden sm:max-w-[26rem]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-panel__glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/40">AvenirLux</p>
              <h2 id="auth-modal-title" className="font-display mt-2 text-2xl font-medium tracking-[-0.03em] text-white sm:text-[1.65rem]">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {mode === "signin" ? "Your reservations and wishlist, privately held." : "Join quietly — curated stays await."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="auth-modal-close" aria-label="Close">
              ×
            </button>
          </div>
          <div className="auth-modal-tabs mb-6 flex rounded-full p-1">
            <button
              type="button"
              className={`auth-modal-tab flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 ${mode === "signin" ? "auth-modal-tab--active" : ""}`}
              onClick={() => onModeChange("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-modal-tab flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 ${mode === "signup" ? "auth-modal-tab--active" : ""}`}
              onClick={() => onModeChange("signup")}
            >
              Sign up
            </button>
          </div>
          <AuthPanelBody
            mode={mode}
            providers={providers}
            callbackUrl="/"
            providersLoading={providersLoading}
            providersError={providersError}
            onSuccess={onClose}
            onModeChange={onModeChange}
            variant="dark"
          />
        </div>
      </div>
    </div>
  );
}
