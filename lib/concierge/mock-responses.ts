import { DESTINATIONS } from "@/lib/liteapi/destinations";
import type { ParsedIntent } from "@/lib/concierge/intent";
import type { ConciergeHotelPick, TripMode } from "@/lib/concierge/types";

export type MockFallbackReason = "unconfigured" | "unavailable" | "quota" | "cached";

export type MockReplyInput = {
  message: string;
  mode: TripMode;
  intent: ParsedIntent;
  hotels: ConciergeHotelPick[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
  fallbackReason?: MockFallbackReason | null;
};

const CITY_GUIDANCE: Record<string, string> = {
  Dubai:
    "Anchor in Downtown or DIFC for skyline views and walkable dining, or the Palm for resort calm. Prioritize residences with club lounges, in-room workspace, and discreet arrival.",
  Paris:
    "Saint-Germain and the 7th reward slow mornings; the Marais suits gallery days. Seek left-bank townhouses or palace hotels with courtyard silence.",
  London:
    "Mayfair and Belgravia for classic service; Marylebone for village ease. Favor properties with afternoon tea salons and thoughtful car service.",
  Tokyo:
    "Ginza and Marunouchi for precision and transit; Aoyama for design-led calm. Ryokan nights pair beautifully with a contemporary five-star core.",
  "New York":
    "Midtown for theatre and meetings; Tribeca and SoHo for character. Corner suites, skyline baths, and a concierge who remembers your name.",
  Milan:
    "Quadrilatero for fashion; Brera for aperitivo culture. Choose properties steps from Via Montenapoleone with late checkout when flying home.",
  Singapore:
    "Marina Bay for iconic views; Orchard for retail; Dempsey for leafy retreat. Sky residences with infinity pools suit short luxury layovers.",
  Barcelona:
    "Eixample for Gaudí and grand boulevards; Born for tapas and galleries. Rooftop pools and sea breezes within fifteen minutes of the Gothic Quarter.",
  Kyoto:
    "Higashiyama for temples at dawn; Arashiyama for bamboo and riverside ryokan. Pair one night in tatami quiet with a contemporary hotel near Nijo.",
  Bali:
    "Uluwatu and Jimbaran for cliff villas; Ubud for wellness and rice terraces. In-villa dining, private pools, and staff who anticipate without announcing.",
  Maldives:
    "One island, one rhythm — overwater villas with house reef snorkeling and sunset dhoni sails. Confirm seaplane timing and butler preferences before arrival.",
  Santorini:
    "Imerovigli for caldera sunsets without the crowds; Oia for iconic views. Cave suites, private terraces, and a sommelier-led Assyrtiko tasting.",
  "Los Cabos":
    "Corridor resorts for golf and sea; San José del Cabo for gallery evenings. Oceanfront suites with plunge pools and a reserved cabana each morning.",
};

function cityFromContext(input: MockReplyInput): string | undefined {
  if (input.intent.city) return input.intent.city;
  const lower = input.message.toLowerCase();
  for (const d of DESTINATIONS) {
    if (lower.includes(d.name.toLowerCase())) return d.name;
  }
  const extras = ["Kyoto", "Rome", "Hong Kong", "Istanbul", "Marrakech", "Cape Town", "Sydney", "Amsterdam", "Monaco"];
  for (const name of extras) {
    if (lower.includes(name.toLowerCase())) return name;
  }
  for (const msg of [...input.history].reverse()) {
    if (msg.role !== "user") continue;
    const l = msg.content.toLowerCase();
    for (const d of DESTINATIONS) {
      if (l.includes(d.name.toLowerCase())) return d.name;
    }
  }
  return undefined;
}

function hotelAppendix(input: MockReplyInput, city?: string): string {
  if (!input.hotels.length) return "";
  const names = input.hotels.map((h) => h.name).join(", ");
  const place = city ?? input.hotels[0]?.city ?? "your destination";
  return `\n\nBelow are ${input.hotels.length} residence${input.hotels.length === 1 ? "" : "s"} from our live collection in ${place} — ${names}. Open any card for rates and availability.`;
}

function itineraryBlock(city: string, mode: TripMode): string {
  if (mode === "romantic") {
    return `**A refined long weekend in ${city}**

**Day one** — unhurried arrival, champagne welcome, dinner somewhere candlelit and walkable.
**Day two** — slow morning, spa or gallery hours, sunset with a private view.
**Day three** — late breakfast, one perfect souvenir moment, graceful departure.`;
  }
  if (mode === "family") {
    return `**A gentle family rhythm in ${city}**

**Day one** — early check-in when possible, pool time, early dinner with flexible seating.
**Day two** — one anchor experience (zoo, museum, boat), quiet afternoon, kid-friendly tasting menu.
**Day three** — market stroll, packing buffer, departure with snacks arranged.`;
  }
  if (mode === "business") {
    return `**Executive cadence in ${city}**

**Arrival day** — express check-in, 45 minutes of movement, light dinner near the hotel.
**Meeting day** — breakfast in-room, car on standby, club lounge between sessions.
**Departure** — late checkout if available, airport transfer confirmed the night before.`;
  }
  return `**Three days of quiet luxury in ${city}**

**Day one** — settle in, neighborhood walk, reservations at a chef-led table.
**Day two** — culture or landscape, long lunch, evening at the property.
**Day three** — market or atelier visit, spa, farewell aperitif.`;
}

function buildCityReply(input: MockReplyInput, city: string): string {
  const guidance = CITY_GUIDANCE[city] ?? `For ${city}, favor central districts with strong concierge desks and recent guest praise above 4.5.`;
  const lower = input.message.toLowerCase();

  if (/\b(itinerary|plan|schedule|days|weekend|week)\b/i.test(lower)) {
    return `${itineraryBlock(city, input.intent.mode)}\n\n${guidance}${hotelAppendix(input, city)}`;
  }

  if (input.intent.wantsHotels || /\b(hotel|stay|suite|resort|villa|residence)\b/i.test(lower)) {
    return `For distinguished stays in **${city}**, I would look to addresses that combine location, discretion, and impeccable housekeeping.

${guidance}

Favor four- and five-star properties with club access when you are on business, or suite-level square footage when traveling as a couple.${hotelAppendix(input, city)}`;
  }

  return `**${city}** rewards travelers who move slowly. ${guidance}

If you share dates and whether this is celebration, family, or business, I can sharpen the rhythm and dining reservations.${hotelAppendix(input, city)}`;
}

function buildKeywordReply(input: MockReplyInput): string | null {
  const lower = input.message.toLowerCase();
  const city = cityFromContext(input);

  if (/\b(spa|wellness|retreat)\b/i.test(lower)) {
    const where = city ? ` in ${city}` : "";
    return `For wellness${where}, book properties with thermal circuits and therapists on staff — not merely a massage room on request. Arrive early for a half-day ritual: heat, cold plunge, body scrub, then herbal tea in silence.${hotelAppendix(input, city)}`;
  }

  if (/\b(restaurant|dining|michelin|dinner)\b/i.test(lower)) {
    const where = city ? ` in ${city}` : " in your city";
    return `Dining${where} should feel inevitable, not rushed. Reserve one anchor table at a chef-led address, one relaxed neighborhood bistro, and keep one evening open for the hotel's own kitchen or room service after a long day.${city ? ` I can align reservations with your hotel's concierge desk once you choose a residence.` : ""}${hotelAppendix(input, city)}`;
  }

  if (/\b(honeymoon|anniversary|proposal)\b/i.test(lower)) {
    return `Congratulations — mark the occasion with one surprise per day, never three. A private dinner, a handwritten note at turndown, and a slow morning with breakfast served on the terrace. ${city ? `In ${city}, ` : ""}suite category matters more than brand name.${hotelAppendix(input, city)}`;
  }

  if (/\b(budget|cheap|affordable)\b/i.test(lower)) {
    return `Luxury is not always the highest rate — it is the best experience for your intent. Share your preferred nightly range and I will prioritize value within four- and five-star houses that still deliver service, safety, and location.${hotelAppendix(input, city)}`;
  }

  return null;
}

function buildModeReply(input: MockReplyInput, city?: string): string {
  const place = city ? ` in ${city}` : "";
  switch (input.intent.mode) {
    case "romantic":
      return `For a romantic journey${place}, compose around privacy and pacing: one exceptional dinner, one shared ritual (spa, sail, or gallery), and mornings without alarms.

Choose a suite with a separate living area so you can each have quiet preparation time before the evening unfolds.${hotelAppendix(input, city)}`;
    case "family":
      return `Family travel${place} succeeds with space and predictability — connecting rooms or two-bedroom residences, calm pools, and kitchens or club lounges for odd-hour meals.

Share children's ages and I will suggest properties with thoughtful kids' programs that still feel refined for adults.${hotelAppendix(input, city)}`;
    case "business":
      return `For business${place}, optimize friction: walkable meetings, reliable Wi‑Fi, express laundry, and a lobby that respects confidentiality.

Book the club level when you have multiple short meetings — the time saved on breakfast and checkout compounds.${hotelAppendix(input, city)}`;
    default:
      return `I would be delighted to compose${place || " your next journey"} — destinations, residences, and a day-by-day rhythm with quiet precision.

Tell me a city, approximate dates, and whether this is celebration, family, or business travel.${hotelAppendix(input, city)}`;
  }
}

/** Premium contextual mock counsel — used for fallback and when OpenAI is not configured. */
export function buildMockConciergeReply(input: MockReplyInput): string {
  const city = cityFromContext(input);
  const keyword = buildKeywordReply(input);
  if (keyword) return keyword;
  if (city) return buildCityReply(input, city);
  return buildModeReply(input, city);
}

/** @deprecated Use buildMockConciergeReply */
export function getMockConciergeReply(message: string, mode: TripMode = "general"): string {
  return buildMockConciergeReply({
    message,
    mode,
    intent: { mode, wantsHotels: false },
    hotels: [],
    history: [],
  });
}
