"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { mergeGuestFavorites } from "@/lib/favorites-api";
import { safeCallbackUrl } from "@/lib/navigation";

type Props = { onSuccess?: () => void; callbackUrl?: string };

export function SignInForm({ onSuccess, callbackUrl: callbackUrlProp }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callbackUrlProp ?? safeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mt-2" autoComplete="email" />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
        Password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium mt-2" autoComplete="current-password" />
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
