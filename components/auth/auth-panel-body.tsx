"use client";

import { Suspense } from "react";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { OAuthSessionSync } from "@/components/auth/oauth-session-sync";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import type { SocialProviderState } from "@/lib/auth/social-types";

type AuthMode = "signin" | "signup";

type Props = {
  mode: AuthMode;
  providers: SocialProviderState[];
  callbackUrl?: string;
  authError?: string | null;
  providersLoading?: boolean;
  providersError?: string | null;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
  variant?: "light" | "dark";
};

export function AuthPanelBody({
  mode,
  providers,
  callbackUrl,
  authError,
  providersLoading,
  providersError,
  onSuccess,
  onModeChange,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";

  return (
    <>
      <Suspense fallback={null}>
        <OAuthSessionSync />
      </Suspense>
      <AuthErrorBanner error={authError} variant={variant} />
      {providersError ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${isDark ? "border border-amber-400/20 bg-amber-400/10 text-amber-100" : "border border-amber-200/80 bg-amber-50/90 text-amber-950"}`}
          role="status"
        >
          {providersError}
        </p>
      ) : null}
      <SocialAuthButtons providers={providers} callbackUrl={callbackUrl} loading={providersLoading} />
      <AuthDivider variant={variant} />
      {mode === "signup" ? (
        <SignUpForm onSuccess={onSuccess} onSwitch={() => onModeChange?.("signin")} callbackUrl={callbackUrl} variant={variant} />
      ) : (
        <SignInForm onSuccess={onSuccess} callbackUrl={callbackUrl} variant={variant} />
      )}
    </>
  );
}
