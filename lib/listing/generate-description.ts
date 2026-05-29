import type { ListingFormState } from "@/lib/listing/types";

export function generateLuxuryDescription(form: ListingFormState): { short: string; full: string } {
  const typeLabel = form.propertyType.replace(/_/g, " ");
  const place = [form.district, form.city, form.country].filter(Boolean).join(", ");
  const short = form.tagline.trim()
    ? form.tagline
    : `Quiet designer ${typeLabel}${place ? ` in ${place}` : ""}.`;

  const amenityPhrase =
    form.amenities.length > 0
      ? `Thoughtfully appointed with ${form.amenities.slice(0, 5).map((a) => a.replace(/_/g, " ")).join(", ")}.`
      : "Curated for guests who value discretion, comfort, and unhurried arrival.";

  const full = [
    form.name ? `**${form.name}**` : `An exceptional ${typeLabel}.`,
    place ? `Set in ${place}, the residence balances privacy with effortless access to the city's finest tables and galleries.` : "",
    form.guestCapacity
      ? `Accommodates up to ${form.guestCapacity} guests across ${form.bedrooms} bedroom${form.bedrooms === 1 ? "" : "s"} with ${form.beds} bed${form.beds === 1 ? "" : "s"} and ${form.bathrooms} bathroom${form.bathrooms === 1 ? "" : "s"}.`
      : "",
    form.squareMeters ? `${form.squareMeters} m² of considered interiors — light, materials, and silence at every turn.` : "",
    amenityPhrase,
    form.instantBooking
      ? "Instant confirmation for seamless arrival."
      : "Personalized confirmation preserves the intimacy of your welcome.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { short, full };
}
