"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { mergeGuestFavorites } from "@/lib/favorites-api";

type Props = { onSuccess?: () => void; onSwitch?: () => void };

export function SignUpForm({ onSuccess, onSwitch }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const reg = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    if (!reg.ok) {
      const data = await reg.json().catch(() => ({}));
      setError(data.error === "Email already registered" ? "This email is already registered" : "Could not create account");
      setLoading(false);
      return;
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Account created — please sign in");
      onSwitch?.();
      return;
    }
    await mergeGuestFavorites();
    onSuccess?.();
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          First name
          <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-premium mt-2" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Last name
          <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-premium mt-2" />
        </label>
      </div>
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mt-2" />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
        Password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium mt-2" placeholder="At least 8 characters" />
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
