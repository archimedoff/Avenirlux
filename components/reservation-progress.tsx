type Step = "hotel" | "reserve" | "checkout" | "confirmation";

const STEPS: { id: Step; label: string }[] = [
  { id: "hotel", label: "Residence" },
  { id: "reserve", label: "Review" },
  { id: "checkout", label: "Details" },
  { id: "confirmation", label: "Confirmed" },
];

export function ReservationProgress({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Reservation progress" className="flex flex-wrap items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
      {STEPS.map((step, i) => (
        <span key={step.id} className="flex items-center gap-2">
          {i > 0 && <span className="text-[var(--border-strong)]">/</span>}
          <span className={i <= idx ? "text-[var(--luxury-ink)]" : ""}>{step.label}</span>
        </span>
      ))}
    </nav>
  );
}
