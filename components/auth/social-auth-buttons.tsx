"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { ProviderIcon } from "@/components/auth/provider-icons";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import { oauthCallbackUrl } from "@/lib/navigation";
import type { SocialProviderId, SocialProviderState } from "@/lib/auth/social-types";

type Props = {
  providers: SocialProviderState[];
  callbackUrl?: string;
  loading?: boolean;
};

function displayProviders(providers: SocialProviderState[]): SocialProviderState[] {
  return providers.map((p) => (p.id === "google" ? { ...p, enabled: true } : p));
}

export function SocialAuthButtons({ providers, callbackUrl = "/", loading = false }: Props) {
  const list = displayProviders(providers);
  const oauthRedirect = oauthCallbackUrl(callbackUrl);
  const [loadingId, setLoadingId] = useState<SocialProviderId | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setGoogleError(null);
    setLoadingId("google");
    const result = await signInWithGoogle();
    if (!result.ok) {
      setLoadingId(null);
      setGoogleError(result.error ?? "Google sign-in unavailable.");
    }
  };

  const handleOther = async (id: SocialProviderId) => {
    setGoogleError(null);
    setLoadingId(id);
    try {
      const result = await signIn(id, { callbackUrl: oauthRedirect, redirect: false });
      if (result?.url) {
        window.location.assign(result.url);
        return;
      }
      setLoadingId(null);
    } catch (err) {
      console.error(`[AvenirLux OAuth] signIn(${id}) failed:`, err);
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2.5" aria-busy="true" aria-label="Loading sign-in options">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="btn-social btn-social--skeleton skeleton-shimmer h-[3.25rem] rounded-[var(--radius-lg)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {googleError && (
        <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
          {googleError}
        </p>
      )}
      {list.map((provider) => {
        const isGoogle = provider.id === "google";
        const isLoading = loadingId === provider.id;
        const isSoon = !isGoogle && !provider.enabled;
        const disabled = isGoogle ? isLoading : isSoon || loadingId !== null;

        return (
          <button
            key={provider.id}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            className={`btn-social ${isSoon ? "btn-social--soon" : ""} ${isLoading ? "btn-social--loading" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isGoogle) {
                void handleGoogle();
                return;
              }
              if (isSoon) return;
              void handleOther(provider.id);
            }}
          >
            <span className="btn-social__icon">
              <ProviderIcon id={provider.id} />
            </span>
            <span className="btn-social__label">
              {isLoading
                ? "Connecting…"
                : isSoon
                  ? `${provider.signInLabel} · Coming soon`
                  : provider.signInLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
