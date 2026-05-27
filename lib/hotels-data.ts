import hotels from "@/data/hotels.json";
import type { Hotel } from "@/lib/hotel-types";

const allHotels = hotels as Hotel[];

export function getAllHotels(): Hotel[] {
  return allHotels;
}

export function getHotelById(id: string): Hotel | null {
  return allHotels.find((hotel) => hotel.id === id) ?? null;
}

export function getHotelsByCity(city?: string): Hotel[] {
  if (!city?.trim()) return allHotels;
  const normalizedCity = city.trim().toLowerCase();
  return allHotels.filter((hotel) => hotel.city.toLowerCase() === normalizedCity);
}

export function getSimilarHotels(id: string, limit = 3): Hotel[] {
  const current = getHotelById(id);
  if (!current) return allHotels.slice(0, limit);

  const sameCountry = allHotels.filter((hotel) => hotel.id !== id && hotel.country === current.country);
  const fallback = allHotels.filter((hotel) => hotel.id !== id && hotel.country !== current.country);
  return [...sameCountry, ...fallback].slice(0, limit);
}
