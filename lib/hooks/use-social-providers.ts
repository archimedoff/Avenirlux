"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SocialProviderState } from "@/lib/auth/social-types";
import { SOCIAL_PROVIDER_META, SOCIAL_PROVIDER_ORDER } from "@/lib/auth/social-types";

/** Safe fallback when API has not responded yet (never mark Google enabled without server). */
function defaultCatalog(): SocialProviderState[] {
  return SOCIAL_PROVIDER_ORDER.map((id) => ({
    ...SOCIAL_PROVIDER_META[id],
    enabled: false,
  }));
}

export function useSocialProviders(_initialFromServer?: SocialProviderState[]) {
  const [providers, setProviders] = useState<SocialProviderState[]>(defaultCatalog);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/social-catalog", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { providers?: SocialProviderState[] };
      if (Array.isArray(data.providers) && data.providers.length > 0) {
        setProviders(data.providers);
      } else {
        throw new Error("Empty provider list");
      }
    } catch (err) {
      console.warn("[AvenirLux OAuth] Failed to load /api/auth/social-catalog", err);
      setError("Could not load sign-in options. Retry or use email.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    void refresh();
  }, [refresh]);

  return { providers, loading, error, refresh };
}
