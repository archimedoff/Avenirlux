import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-content-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-md)]">
      <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl">Hotel not found</h1>
      <p className="mt-3 text-[0.9375rem] text-[var(--foreground-muted)]">The listing you requested does not exist.</p>
      <Link href="/hotels" className="btn-primary mt-8 justify-self-center">
        Browse available hotels
      </Link>
    </main>
  );
}
