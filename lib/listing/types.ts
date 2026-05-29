export const PROPERTY_TYPES = [
  { id: "hotel", icon: "🏨", labelKey: "hotel" },
  { id: "apartment", icon: "🏢", labelKey: "apartment" },
  { id: "studio", icon: "🛋️", labelKey: "studio" },
  { id: "villa", icon: "🏡", labelKey: "villa" },
  { id: "penthouse", icon: "🌆", labelKey: "penthouse" },
  { id: "residence", icon: "🏛️", labelKey: "residence" },
  { id: "cabin", icon: "🌲", labelKey: "cabin" },
  { id: "beach_house", icon: "🏖️", labelKey: "beach_house" },
  { id: "boutique_stay", icon: "✨", labelKey: "boutique_stay" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["id"];

export const AMENITY_IDS = [
  "wifi",
  "air_conditioning",
  "smart_tv",
  "kitchen",
  "washer",
  "dryer",
  "coffee_machine",
  "balcony",
  "sea_view",
  "mountain_view",
  "pool",
  "gym",
  "spa",
  "parking",
  "self_check_in",
  "workspace",
  "beach_nearby",
  "private_beach",
  "pet_friendly",
  "breakfast",
] as const;

export type AmenityId = (typeof AMENITY_IDS)[number];

export type ListingRoom = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
};

export type ListingFormState = {
  propertyType: PropertyType;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  guestCapacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  squareMeters: number;
  floor?: number;
  image: string;
  gallery: string[];
  amenities: AmenityId[];
  city: string;
  country: string;
  district: string;
  address: string;
  landmarks: string;
  coordinates: { lat: number; lng: number };
  pricePerNight: number;
  weekendPrice: number;
  currency: string;
  cleaningFee: number;
  unavailableDates: string[];
  minNights: number;
  instantBooking: boolean;
  cancellationPolicy: string;
  rooms: ListingRoom[];
  status: "draft" | "pending_review";
};

export type ListingMetadata = {
  propertyType: PropertyType;
  tagline?: string;
  shortDescription?: string;
  guestCapacity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  squareMeters?: number;
  floor?: number;
  address?: string;
  district?: string;
  landmarks?: string;
  currency?: string;
  weekendPrice?: number;
  cleaningFee?: number;
  unavailableDates?: string[];
  minNights?: number;
  instantBooking?: boolean;
};
