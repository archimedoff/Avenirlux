import type { ListingFormState } from "@/lib/listing/types";

export function createInitialListingForm(): ListingFormState {
  return {
    propertyType: "residence",
    name: "",
    tagline: "",
    shortDescription: "",
    description: "",
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    squareMeters: 0,
    floor: undefined,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery: [],
    amenities: [],
    city: "",
    country: "",
    district: "",
    address: "",
    landmarks: "",
    coordinates: { lat: 0, lng: 0 },
    pricePerNight: 450,
    weekendPrice: 520,
    currency: "USD",
    cleaningFee: 85,
    unavailableDates: [],
    minNights: 2,
    instantBooking: false,
    cancellationPolicy: "Flexible cancellation up to 7 days before arrival.",
    rooms: [
      {
        id: "room-1",
        name: "Signature Suite",
        description: "Premium suite with curated amenities",
        pricePerNight: 450,
        maxGuests: 2,
      },
    ],
    status: "draft",
  };
}
