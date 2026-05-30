export const PROPERTY_TYPES = [
  { id: "hotel", icon: "🏨", labelKey: "hotel" },
  { id: "apartment", icon: "🏢", labelKey: "apartment" },
  { id: "villa", icon: "🏡", labelKey: "villa" },
  { id: "studio", icon: "🛋️", labelKey: "studio" },
  { id: "penthouse", icon: "🌆", labelKey: "penthouse" },
  { id: "guest_house", icon: "🏠", labelKey: "guest_house" },
  { id: "resort_villa", icon: "🌴", labelKey: "resort_villa" },
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
  status: "draft" | "pending_review" | "published";
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
