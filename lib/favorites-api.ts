"use client";

import { getFavorites } from "@/lib/favorites";

export async function fetchAccountFavorites(): Promise<string[]> {
  const res = await fetch("/api/account/favorites", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.hotelIds ?? [];
}

export async function toggleAccountFavorite(hotelId: string): Promise<string[]> {
  const current = await fetchAccountFavorites();
  const isOn = current.includes(hotelId);
  const res = await fetch(
    isOn ? `/api/account/favorites?hotelId=${encodeURIComponent(hotelId)}` : "/api/account/favorites",
    {
      method: isOn ? "DELETE" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: isOn ? undefined : JSON.stringify({ hotelId }),
    }
  );
  if (!res.ok) throw new Error("Failed to update favorite");
  const data = await res.json();
  return data.hotelIds ?? [];
}

export async function mergeGuestFavorites(): Promise<void> {
  const local = getFavorites();
  if (local.length === 0) return;
  await fetch("/api/account/favorites/merge", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hotelIds: local }),
  });
}
