"use client";

import { Suspense } from "react";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { OAuthSessionSync } from "@/components/auth/oauth-session-sync";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import type { SocialProviderMeta } from "@/lib/auth/social-types";

type AuthMode = "signin" | "signup";

type Props = {
  mode: AuthMode;
  providers: SocialProviderMeta[];
  callbackUrl?: string;
  authError?: string | null;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
};

export function AuthPanelBody({ mode, providers, callbackUrl, authError, onSuccess, onModeChange }: Props) {
  const hasSocial = providers.length > 0;

  return (
    <>
      <Suspense fallback={null}>
        <OAuthSessionSync />
      </Suspense>
      <AuthErrorBanner error={authError} />
      {hasSocial && <SocialAuthButtons providers={providers} callbackUrl={callbackUrl} />}
      {hasSocial && <AuthDivider />}
      {mode === "signup" ? (
        <SignUpForm onSuccess={onSuccess} onSwitch={() => onModeChange?.("signin")} callbackUrl={callbackUrl} />
      ) : (
        <SignInForm onSuccess={onSuccess} callbackUrl={callbackUrl} />
      )}
    </>
  );
}
