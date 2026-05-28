"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { useSocialProviders } from "@/lib/hooks/use-social-providers";
import type { SocialProviderState } from "@/lib/auth/social-types";

type AuthMode = "signin" | "signup";

type AuthModalContextValue = {
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({
  children,
  socialProviders = [],
}: {
  children: ReactNode;
  socialProviders?: SocialProviderState[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const { providers, loading, error, refresh } = useSocialProviders(socialProviders);

  const openAuth = useCallback(
    (next: AuthMode = "signin") => {
      setMode(next);
      setOpen(true);
      void refresh();
    },
    [refresh],
  );

  const closeAuth = useCallback(() => setOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal
        open={open}
        mode={mode}
        providers={providers}
        providersLoading={loading}
        providersError={error}
        onClose={closeAuth}
        onModeChange={setMode}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
