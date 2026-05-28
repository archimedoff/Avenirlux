import type { Hotel, HotelCatalogEntry, HotelFilters } from "@/lib/hotel-types";

export interface HotelRepository {
  getAll(): Hotel[];
  getById(id: string): Hotel | null;
  getCities(): string[];
  getDestinations(): { name: string; slug: string; country: string; image: string; tag: string }[];
  search(filters: HotelFilters): Hotel[];
  getSimilar(id: string, limit?: number): Hotel[];
  getAllAmenities(): string[];
}

export type { Hotel, HotelCatalogEntry, HotelFilters };
