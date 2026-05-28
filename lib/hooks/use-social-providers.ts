"use client";

import { useCallback, useEffect, useState } from "react";

import type { SocialProviderState } from "@/lib/auth/social-types";

export function useSocialProviders(initial: SocialProviderState[]) {
  const [providers, setProviders] = useState<SocialProviderState[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/providers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { providers: SocialProviderState[] };
      if (Array.isArray(data.providers) && data.providers.length > 0) {
        setProviders(data.providers);
      }
    } catch {
      setError("Could not refresh sign-in options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setProviders(initial);
  }, [initial]);

  return { providers, loading, error, refresh };
}
