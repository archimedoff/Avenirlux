"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { fetchAccountFavorites, toggleAccountFavorite } from "@/lib/favorites-api";

type Props = {
  hotelId: string;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({ hotelId, className = "", size = "md" }: Props) {
  const { data: session, status } = useSession();
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(async () => {
    if (session?.user) {
      const ids = await fetchAccountFavorites();
      setActive(ids.includes(hotelId));
    } else {
      setActive(isFavorite(hotelId));
    }
  }, [session?.user, hotelId]);

  useEffect(() => {
    setMounted(true);
    if (status === "loading") return;
    void refresh();
  }, [status, refresh]);

  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={active}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (session?.user) {
          try {
            const ids = await toggleAccountFavorite(hotelId);
            setActive(ids.includes(hotelId));
          } catch {
            /* ignore */
          }
        } else {
          setActive(toggleFavorite(hotelId));
        }
      }}
      className={`inline-flex ${sizeClass} items-center justify-center rounded-full border border-white/30 bg-black/20 text-white/90 backdrop-blur-md transition-[transform,background-color,border-color,color] duration-300 hover:scale-105 hover:border-white/60 hover:bg-black/35 ${active ? "!text-rose-200" : ""} ${className}`}
    >
      <span className={mounted && active ? "scale-110" : ""}>{mounted && active ? "♥" : "♡"}</span>
    </button>
  );
}
