"use client";

import { ConciergePanel } from "@/components/concierge/concierge-panel";
import { FloatingConciergeButton } from "@/components/concierge/floating-concierge-button";

export function ConciergeShell() {
  return (
    <>
      <FloatingConciergeButton />
      <ConciergePanel />
    </>
  );
}
