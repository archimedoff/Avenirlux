"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import type { SocialProviderState } from "@/lib/auth/social-types";

export function AppProviders({
  children,
  socialProviders = [],
}: {
  children: ReactNode;
  socialProviders?: SocialProviderState[];
}) {
  return (
    <SessionProvider>
      <AuthModalProvider socialProviders={socialProviders}>{children}</AuthModalProvider>
    </SessionProvider>
  );
}
