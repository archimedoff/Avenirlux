"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { ConciergeProvider } from "@/components/concierge/concierge-context";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import type { SocialProviderState } from "@/lib/auth/social-types";

export function AppProviders({
  children,
  socialProviders = [],
}: {
  children: ReactNode;
  socialProviders?: SocialProviderState[];
}) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      <LocaleProvider>
        <ConciergeProvider>
          <AuthModalProvider socialProviders={socialProviders}>{children}</AuthModalProvider>
        </ConciergeProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
