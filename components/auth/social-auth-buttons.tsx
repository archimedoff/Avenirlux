"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ProviderIcon } from "@/components/auth/provider-icons";
import { oauthCallbackUrl } from "@/lib/navigation";
import type { SocialProviderId, SocialProviderState } from "@/lib/auth/social-types";

type Props = {
  providers: SocialProviderState[];
  callbackUrl?: string;
  loading?: boolean;
};

function otherProviders(providers: SocialProviderState[]): SocialProviderState[] {
  return providers.filter((p) => p.id !== "google");
}

export function SocialAuthButtons({ providers, callbackUrl = "/", loading = false }: Props) {
  const others = otherProviders(providers);
  const oauthRedirect = oauthCallbackUrl(callbackUrl);
  const [loadingId, setLoadingId] = useState<SocialProviderId | null>(null);

  const handleOther = async (id: SocialProviderId) => {
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
      <GoogleSignInButton />
      {others.map((provider) => {
        const isLoading = loadingId === provider.id;
        const isSoon = !provider.enabled;
        const disabled = isSoon || loadingId !== null;

        return (
          <button
            key={provider.id}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            className={`btn-social ${isSoon ? "btn-social--soon" : ""} ${isLoading ? "btn-social--loading" : ""}`}
            onClick={() => {
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
