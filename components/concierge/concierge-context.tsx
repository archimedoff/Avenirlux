"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ConciergeContextValue = {
  open: boolean;
  openConcierge: () => void;
  closeConcierge: () => void;
  toggleConcierge: () => void;
};

const ConciergeCtx = createContext<ConciergeContextValue | null>(null);

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openConcierge = useCallback(() => setOpen(true), []);
  const closeConcierge = useCallback(() => setOpen(false), []);
  const toggleConcierge = useCallback(() => setOpen((o) => !o), []);

  return (
    <ConciergeCtx.Provider value={{ open, openConcierge, closeConcierge, toggleConcierge }}>
      {children}
    </ConciergeCtx.Provider>
  );
}

export function useConcierge() {
  const ctx = useContext(ConciergeCtx);
  if (!ctx) throw new Error("useConcierge must be used within ConciergeProvider");
  return ctx;
}
