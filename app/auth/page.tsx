import { Suspense } from "react";
import Link from "next/link";

import { AuthPanelBody } from "@/components/auth/auth-panel-body";
import { getSocialProviderCatalog } from "@/lib/auth/providers-meta";
import { safeCallbackUrl } from "@/lib/navigation";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string; callbackUrl?: string; error?: string }>;
};

function authModeHref(mode: "signin" | "signup", callbackUrl?: string) {
  const q = new URLSearchParams({ mode });
  const safe = callbackUrl ? safeCallbackUrl(callbackUrl, "") : "";
  if (safe) q.set("callbackUrl", safe);
  return `/auth?${q.toString()}`;
}

export const dynamic = "force-dynamic";

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const socialProviders = getSocialProviderCatalog();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <section className="auth-modal-panel auth-modal-panel--page page-enter relative w-full max-w-md overflow-hidden p-8 sm:max-w-[26rem] sm:p-10">
        <div className="auth-modal-panel__glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <Link href="/" className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/70">
            ← AvenirLux
          </Link>
          <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-white">
            {mode === "signup" ? "Join quietly" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {mode === "signup"
              ? "Your stays, saved hotels, and concierge — in one place."
              : "Access your reservations and wishlist."}
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="animate-pulse text-sm text-white/40">Loading…</p>}>
              <AuthPanelBody
                mode={mode}
                providers={socialProviders}
                callbackUrl={callbackUrl}
                authError={params.error}
                variant="dark"
              />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-white/50">
            {mode === "signup" ? (
              <>
                Already a member?{" "}
                <Link href={authModeHref("signin", params.callbackUrl)} className="font-medium text-white/90 hover:text-white">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to AvenirLux?{" "}
                <Link href={authModeHref("signup", params.callbackUrl)} className="font-medium text-white/90 hover:text-white">
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
