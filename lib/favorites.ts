const KEY = "avenirlux_favorites_v1";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFavorite(hotelId: string): boolean {
  return getFavorites().includes(hotelId);
}

export function toggleFavorite(hotelId: string): boolean {
  const list = getFavorites();
  const next = list.includes(hotelId) ? list.filter((id) => id !== hotelId) : [...list, hotelId];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.includes(hotelId);
}
