"use client";

import { useConcierge } from "@/components/concierge/concierge-context";

export function FloatingConciergeButton() {
  const { open, toggleConcierge } = useConcierge();

  return (
    <button
      type="button"
      className={`concierge-fab ${open ? "concierge-fab--open" : ""}`}
      onClick={toggleConcierge}
      aria-label={open ? "Close AI concierge" : "Open AI concierge"}
      aria-expanded={open}
    >
      <span className="concierge-fab__icon" aria-hidden>
        {open ? "×" : "✦"}
      </span>
      <span className="concierge-fab__label">Concierge</span>
    </button>
  );
}
