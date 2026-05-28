import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children?: ReactNode;
};

export function EmptyState({ title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-8 py-14 text-center shadow-[var(--shadow-md)]">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">{description}</p> : null}
      {children}
      {action ? (
        <Link href={action.href} className="btn-primary mt-8">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
