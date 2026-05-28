"use client";

import Link from "next/link";

type ErrorStateProps = {
  title?: string;
  message?: string;
  reset?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We could not complete your request. Please try again in a moment.",
  reset,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">AvenirLux</p>
      <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {reset ? (
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
        ) : null}
        <Link href="/" className="btn-secondary">
          Return home
        </Link>
      </div>
    </div>
  );
}
