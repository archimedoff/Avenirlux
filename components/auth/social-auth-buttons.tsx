"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { ProviderIcon } from "@/components/auth/provider-icons";
import { oauthCallbackUrl } from "@/lib/navigation";
import type { SocialProviderState } from "@/lib/auth/social-types";

type Props = {
  providers: SocialProviderState[];
  callbackUrl?: string;
  loading?: boolean;
};

export function SocialAuthButtons({ providers, callbackUrl = "/account", loading = false }: Props) {
  const oauthRedirect = oauthCallbackUrl(callbackUrl);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      {providers.map((provider) => {
        const isLoading = loadingId === provider.id;
        const disabled = !provider.enabled || loadingId !== null;

        return (
          <button
            key={provider.id}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            className={`btn-social ${!provider.enabled ? "btn-social--soon" : ""} ${isLoading ? "btn-social--loading" : ""}`}
            onClick={() => {
              if (!provider.enabled) return;
              setLoadingId(provider.id);
              void signIn(provider.id, { callbackUrl: oauthRedirect });
            }}
          >
            <span className="btn-social__icon">
              <ProviderIcon id={provider.id} />
            </span>
            <span className="btn-social__label">
              {isLoading ? "Connecting…" : provider.enabled ? provider.signInLabel : `${provider.signInLabel} · Coming soon`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
