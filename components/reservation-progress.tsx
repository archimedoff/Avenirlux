type Step = "hotel" | "reserve" | "checkout" | "payment" | "confirmation";

const STEPS: { id: Step; label: string }[] = [
  { id: "hotel", label: "Residence" },
  { id: "reserve", label: "Review" },
  { id: "checkout", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmed" },
];

export function ReservationProgress({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Reservation progress" className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {STEPS.map((step, i) => (
        <span key={step.id} className="flex items-center gap-2">
          {i > 0 && <span className="text-[var(--border-strong)]">/</span>}
          <span
            className={`eyebrow transition-colors duration-300 ${i <= idx ? "text-[var(--luxury-gold-muted)]" : "text-[var(--foreground-subtle)]"}`}
          >
            {step.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
