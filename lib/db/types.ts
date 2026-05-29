import type { ListingMetadata } from "@/lib/listing/types";

export type ConciergePreferences = {
  contactChannel: "email" | "phone" | "whatsapp";
  preferredLanguage: string;
  dietaryNotes?: string;
  transportNotes?: string;
};

export type UserRole = "guest" | "host" | "admin";

export type ListingStatus = "draft" | "pending_review" | "published" | "rejected";

export type HostListingRecord = {
  id: string;
  ownerId: string;
  status: ListingStatus;
  name: string;
  city: string;
  country: string;
  location: string;
  description: string;
  image: string;
  gallery: string[];
  amenities: string[];
  categories: string[];
  pricePerNight: number;
  rooms: { id: string; name: string; description: string; pricePerNight: number; maxGuests: number }[];
  coordinates: { lat: number; lng: number };
  cancellationPolicy: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  metadata?: ListingMetadata;
};

export type BookingRequestRecord = {
  id: string;
  listingId: string;
  ownerId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  total: number;
  status: "pending" | "confirmed" | "declined";
  createdAt: string;
};

export type UserProfile = {
  phone?: string;
  country?: string;
  avatarUrl?: string;
};

export type OAuthProviderId = "google" | "apple" | "facebook" | "twitter";

export type OAuthAccountLink = {
  accountId: string;
  linkedAt: string;
};

export type UserRecord = {
  role: UserRole;
  id: string;
  email: string;
  /** Empty when the account is OAuth-only (no email password set). */
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  profile: UserProfile;
  conciergePreferences: ConciergePreferences;
  oauthAccounts?: Partial<Record<OAuthProviderId, OAuthAccountLink>>;
};

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export type UserBookingRecord = {
  id: string;
  userId: string;
  confirmationRef: string;
  status: BookingStatus;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  total: number;
  createdAt: string;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;
