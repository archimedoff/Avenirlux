"use client";

import { signIn } from "next-auth/react";

export const GOOGLE_SIGN_IN_CALLBACK = "/";

/** Starts Google OAuth — redirects the browser to Google's consent screen. */
export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  try {
    await signIn("google", { callbackUrl: GOOGLE_SIGN_IN_CALLBACK });
    return { ok: true };
  } catch (err) {
    console.error("[AvenirLux OAuth] signIn(google) threw:", err);
    return { ok: false, error: "Google sign-in failed unexpectedly." };
  }
}
