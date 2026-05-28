"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { mergeGuestFavorites } from "@/lib/favorites-api";
import { safeCallbackUrl } from "@/lib/navigation";

/** After OAuth redirect, merge guest favorites and honor callbackUrl. */
export function OAuthSessionSync() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || handled.current) return;
    handled.current = true;
    const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
    void mergeGuestFavorites().finally(() => {
      router.replace(callbackUrl);
      router.refresh();
    });
  }, [status, router, searchParams]);

  return null;
}
