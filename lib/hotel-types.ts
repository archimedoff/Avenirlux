export type AvailabilityStatus = "available" | "limited";

export type LuxuryCategory =
  | "beachfront"
  | "spa"
  | "villa"
  | "resort"
  | "penthouse";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
};

export type Hotel = {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  amenities: string[];
  categories: LuxuryCategory[];
  coordinates: Coordinates;
  description: string;
  reviewsSummary: string[];
  availability: AvailabilityStatus;
  rooms: Room[];
  experiences: string[];
  cancellationPolicy: string;
  poeticTagline: string;
};

/** Raw catalog shape stored in JSON before enrichment. */
export type HotelCatalogEntry = Omit<
  Hotel,
  "availability" | "rooms" | "experiences" | "cancellationPolicy" | "poeticTagline"
>;

export type HotelFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  guests?: number;
  categories?: LuxuryCategory[];
  availability?: AvailabilityStatus;
  amenity?: string;
};

export type HotelSearchParams = {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  category?: string;
};
