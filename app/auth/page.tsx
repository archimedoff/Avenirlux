import { Suspense } from "react";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <main className="flex min-h-[70vh] items-center justify-center py-10">
      <section className="auth-panel page-enter relative w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-xl)] sm:p-10">
        <div className="auth-panel-shine pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          <Link href="/" className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            ← AvenirLux
          </Link>
          <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em]">
            {mode === "signup" ? "Join quietly" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {mode === "signup" ? "Your stays, saved hotels, and concierge — in one place." : "Access your reservations and wishlist."}
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="animate-pulse text-sm">Loading…</p>}>
              {mode === "signup" ? (
                <SignUpForm />
              ) : (
                <SignInForm />
              )}
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
            {mode === "signup" ? (
              <>
                Already a member?{" "}
                <Link href="/auth?mode=signin" className="font-medium text-[var(--foreground)]">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to AvenirLux?{" "}
                <Link href="/auth?mode=signup" className="font-medium text-[var(--foreground)]">
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
