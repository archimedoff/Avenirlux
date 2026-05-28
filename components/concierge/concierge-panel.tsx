"use client";

import { ConciergeChat } from "@/components/concierge/concierge-chat";
import { useConcierge } from "@/components/concierge/concierge-context";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";

export function ConciergePanel() {
  const { open, closeConcierge } = useConcierge();
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div className="concierge-root" role="dialog" aria-modal="true" aria-label="AI Concierge">
      <button type="button" className="concierge-root__backdrop" aria-label="Close" onClick={closeConcierge} />
      <div className="concierge-root__panel page-enter">
        <ConciergeChat onClose={closeConcierge} />
      </div>
    </div>
  );
}
