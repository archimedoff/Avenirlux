import type { ListingFormState, ListingMetadata } from "@/lib/listing/types";

export function listingFormToApiPayload(form: ListingFormState) {
  const metadata: ListingMetadata = {
    propertyType: form.propertyType,
    tagline: form.tagline || undefined,
    shortDescription: form.shortDescription || undefined,
    guestCapacity: form.guestCapacity,
    bedrooms: form.bedrooms,
    beds: form.beds,
    bathrooms: form.bathrooms,
    squareMeters: form.squareMeters || undefined,
    floor: form.floor,
    address: form.address || undefined,
    district: form.district || undefined,
    landmarks: form.landmarks || undefined,
    currency: form.currency,
    weekendPrice: form.weekendPrice || undefined,
    cleaningFee: form.cleaningFee || undefined,
    unavailableDates: form.unavailableDates,
    minNights: form.minNights,
    instantBooking: form.instantBooking,
  };

  const fullDescription = [form.shortDescription, form.description].filter(Boolean).join("\n\n");

  return {
    name: form.name || "Untitled residence",
    description: fullDescription,
    city: form.city,
    country: form.country,
    location: form.district,
    image: form.image,
    gallery: form.gallery,
    amenities: form.amenities,
    categories: [form.propertyType],
    pricePerNight: form.pricePerNight,
    rooms: form.rooms,
    coordinates: form.coordinates,
    cancellationPolicy: form.cancellationPolicy,
    status: form.status,
    metadata,
  };
}
