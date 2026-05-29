import type { TripMode } from "@/lib/concierge/types";

/** Phase 1 — deterministic mock replies. Replace with AI provider in Phase 2. */
export function getMockConciergeReply(message: string, mode: TripMode = "general"): string {
  const lower = message.toLowerCase();

  if (lower.includes("kyoto")) {
    return `Kyoto rewards unhurried travelers. I would begin in Higashiyama — a discreet ryokan with a private onsen, dawn at Fushimi Inari before the crowds, and kaiseki one evening in a machiya townhouse.

For residences, our collection will surface quiet five-star options with tatami suites and garden views once live search is connected.`;
  }

  if (lower.includes("paris") && (lower.includes("romantic") || mode === "romantic")) {
    return `A romantic Paris weekend, composed with restraint:

**Friday** — arrival, champagne welcome, candlelit dinner in Saint-Germain.
**Saturday** — couples spa, Left Bank galleries, sunset on the Seine.
**Sunday** — late breakfast, private garden or boat, unhurried departure.

Share your preferred arrondissement and I shall refine this further.`;
  }

  if (lower.includes("bali") || lower.includes("villa")) {
    return `Bali's finest beach villas favor Uluwatu and Jimbaran — cliffside silence, private pools, and staff who anticipate rather than announce.

Look for residences with in-villa dining, sunset decks, and temple access at golden hour.`;
  }

  if (lower.includes("dubai") || mode === "business") {
    return `For Dubai business travel, prioritize DIFC or Downtown — walkable meetings, executive lounges, and reliable car service.

**Essentials:** express check-in, in-room workspace, 24-hour concierge, and a quiet club lounge. Arrive a day early when timezone shifts matter.`;
  }

  if (mode === "family") {
    return `Family journeys call for space, calm pools, and thoughtful children's menus without sacrificing refinement.

Share your children's ages and preferred region — I will sketch a gentle rhythm for your stay.`;
  }

  return `Thank you for writing. I am your AvenirLux concierge — here to compose destinations, residences, itineraries, and hidden gems with quiet precision.

This is a preview with curated sample guidance. Live availability and deeper personalization arrive in a later release.

How may I refine your journey — romantic, family, business, or a city you have in mind?`;
}
