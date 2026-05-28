const KEY = "avenirlux_recent_v1";
const MAX = 8;

export type RecentHotel = {
  id: string;
  name: string;
  image: string;
  city: string;
  viewedAt: string;
};

export function getRecentlyViewed(): RecentHotel[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(hotel: Omit<RecentHotel, "viewedAt">): void {
  const list = getRecentlyViewed().filter((h) => h.id !== hotel.id);
  const next = [{ ...hotel, viewedAt: new Date().toISOString() }, ...list].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}
