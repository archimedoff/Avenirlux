"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { mergeGuestFavorites } from "@/lib/favorites-api";
import { safeCallbackUrl } from "@/lib/navigation";

type Props = { onSuccess?: () => void; callbackUrl?: string; variant?: "light" | "dark" };

export function SignInForm({ onSuccess, callbackUrl: callbackUrlProp, variant = "light" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callbackUrlProp ?? safeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dark = variant === "dark";
  const labelClass = dark
    ? "block text-xs font-semibold uppercase tracking-[0.12em] text-white/45"
    : "block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]";
  const inputClass = dark ? "input-premium-dark mt-2" : "input-premium mt-2";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    await mergeGuestFavorites();
    onSuccess?.();
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className={dark ? "rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-100" : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"}>
          {error}
        </p>
      )}
      <label className={labelClass}>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
      </label>
      <label className={labelClass}>
        Password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
      </label>
      <button type="submit" disabled={loading} className={`w-full py-3.5 ${dark ? "btn-primary-glow" : "btn-primary"}`}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
