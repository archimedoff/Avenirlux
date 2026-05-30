"use client";

import { CONCIERGE_UPSELLS } from "@/lib/reservation/upsells";
import { formatUsd } from "@/lib/booking-utils";

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
};

export function ConciergeUpsells({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow eyebrow-gold">Concierge enhancements</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
          Curated add-ons arranged by your private host team before arrival.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONCIERGE_UPSELLS.map((upsell) => {
          const active = selected.includes(upsell.id);
          return (
            <button
              key={upsell.id}
              type="button"
              onClick={() => toggle(upsell.id)}
              className={`rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-300 ${
                active
                  ? "border-[rgba(201,169,98,0.45)] bg-[rgba(201,169,98,0.08)] shadow-[var(--shadow-sm)]"
                  : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{upsell.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">{upsell.description}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-[var(--luxury-gold)]">{formatUsd(upsell.price)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
