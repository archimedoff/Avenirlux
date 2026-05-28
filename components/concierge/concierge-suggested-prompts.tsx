"use client";

import { SUGGESTED_PROMPTS } from "@/lib/concierge/suggested-prompts";
import type { TripMode } from "@/lib/concierge/types";

type Props = {
  onSelect: (message: string, mode?: TripMode) => void;
  disabled?: boolean;
};

export function ConciergeSuggestedPrompts({ onSelect, disabled }: Props) {
  return (
    <div className="concierge-prompts">
      <p className="concierge-prompts__title">Suggested</p>
      <div className="concierge-prompts__grid">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            className="concierge-prompt-chip"
            onClick={() => onSelect(p.message, p.mode)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
