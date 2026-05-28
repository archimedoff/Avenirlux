"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { ProviderIcon } from "@/components/auth/provider-icons";
import { oauthCallbackUrl } from "@/lib/navigation";
import type { SocialProviderMeta } from "@/lib/auth/social-types";

type Props = {
  providers: SocialProviderMeta[];
  callbackUrl?: string;
};

export function SocialAuthButtons({ providers, callbackUrl = "/account" }: Props) {
  const oauthRedirect = oauthCallbackUrl(callbackUrl);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (providers.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={loadingId !== null}
          className="btn-social"
          onClick={() => {
            setLoadingId(provider.id);
            void signIn(provider.id, { callbackUrl: oauthRedirect });
          }}
        >
          <span className="btn-social__icon">
            <ProviderIcon id={provider.id} />
          </span>
          <span className="btn-social__label">
            {loadingId === provider.id ? "Connecting…" : provider.signInLabel}
          </span>
        </button>
      ))}
    </div>
  );
}
