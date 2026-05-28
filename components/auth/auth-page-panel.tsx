"use client";

import { AuthPanelBody } from "@/components/auth/auth-panel-body";
import { useSocialProviders } from "@/lib/hooks/use-social-providers";

type Props = {
  mode: "signin" | "signup";
  callbackUrl: string;
  authError?: string | null;
};

export function AuthPagePanel({ mode, callbackUrl, authError }: Props) {
  const { providers, loading, error } = useSocialProviders();

  return (
    <AuthPanelBody
      mode={mode}
      providers={providers}
      callbackUrl={callbackUrl}
      authError={authError}
      providersLoading={loading}
      providersError={error}
      variant="dark"
    />
  );
}
