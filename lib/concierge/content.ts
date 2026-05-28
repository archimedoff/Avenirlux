import type { TripMode } from "@/lib/concierge/types";

const HIDDEN_GEMS: Record<string, string[]> = {
  Paris: [
    "Twilight in the Palais-Royal arcades before a chef's table in the 7th.",
    "Private viewing at a Left Bank gallery — we arrange atelier introductions.",
  ],
  Kyoto: [
    "Dawn at Fushimi Inari, then kaiseki in a machiya townhouse.",
    "Private tea ceremony in Higashiyama with a fourth-generation master.",
  ],
  Bali: [
    "Sunrise at Jatiluwih with a villa-arranged picnic.",
    "Water blessing at Tirta Empul timed for the quietest hour.",
  ],
  Dubai: [
    "Desert falconry at dawn, breakfast in a Bedouin-style camp.",
    "Private dhow cruise along the Creek at golden hour.",
  ],
  Tokyo: [
    "Early Tsukiji outer market tasting with a sommelier guide.",
    "Evening jazz in Ginza — we hold preferred reservations.",
  ],
};

const ITINERARY: Record<TripMode, (city: string) => string[]> = {
  general: (c) => [
    `Arrival — unhurried check-in and sunset aperitifs in ${c}.`,
    `Day two — private cultural immersion, chef's table lunch, evening at leisure.`,
    `Day three — wellness morning, curated gallery time, signature farewell dinner.`,
  ],
  romantic: (c) => [
    `Arrival — champagne welcome and candlelit dinner for two in ${c}.`,
    `Day two — couples spa, wandering afternoon, sunset rooftop cocktails.`,
    `Day three — late breakfast, private boat or garden experience, intimate farewell.`,
  ],
  family: (c) => [
    `Arrival — family suite, relaxed dinner with thoughtful children's menus.`,
    `Day two — engaging morning activity, pool afternoon, early evening show.`,
    `Day three — interactive cultural visit, flexible lunch, departure treats.`,
  ],
  business: (c) => [
    `Arrival — express check-in, suite workspace review, discreet dinner.`,
    `Day two — car service and meeting support, networking dinner on request.`,
    `Day three — efficient checkout, airport transfer with Wi‑Fi.`,
  ],
};

export function getHiddenGems(city?: string): string[] {
  if (!city) return [
    "A concierge-led walk the hour before golden hour.",
    "A table at a restaurant with no signage — we maintain those relationships.",
  ];
  return HIDDEN_GEMS[city] ?? [
    `A locally loved salon de thé in ${city} — arrive before ten.`,
    `An evening with a private guide through districts most visitors miss.`,
  ];
}

export function getItinerary(mode: TripMode, city: string): string[] {
  return ITINERARY[mode](city || "your destination");
}

export function modeLabel(mode: TripMode): string {
  if (mode === "romantic") return "Romantic";
  if (mode === "family") return "Family";
  if (mode === "business") return "Business";
  return "Curated";
}
