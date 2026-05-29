import { DESTINATIONS } from "@/lib/liteapi/destinations";
import type { TripMode } from "@/lib/concierge/types";

const EXTRA_CITIES = [
  "Kyoto",
  "Rome",
  "Los Angeles",
  "Hong Kong",
  "Istanbul",
  "Marrakech",
  "Cape Town",
  "Sydney",
  "Amsterdam",
  "Zurich",
  "Geneva",
  "Monaco",
] as const;

const ALL_CITIES = [...DESTINATIONS.map((d) => d.name), ...EXTRA_CITIES];

const MODE_PATTERNS: Array<{ mode: TripMode; pattern: RegExp }> = [
  { mode: "romantic", pattern: /\b(romantic|honeymoon|couple|anniversary|valentine|intimate)\b/i },
  { mode: "family", pattern: /\b(family|families|kids|children|child-friendly)\b/i },
  { mode: "business", pattern: /\b(business|conference|work|executive|meeting)\b/i },
];

export type ParsedIntent = {
  city?: string;
  mode: TripMode;
  wantsHotels: boolean;
};

export function parseIntent(message: string, modeOverride?: TripMode): ParsedIntent {
  const text = message.trim();
  const lower = text.toLowerCase();

  let mode: TripMode = modeOverride ?? "general";
  if (!modeOverride) {
    for (const { mode: m, pattern } of MODE_PATTERNS) {
      if (pattern.test(text)) {
        mode = m;
        break;
      }
    }
  }

  let city: string | undefined;
  for (const name of ALL_CITIES) {
    if (lower.includes(name.toLowerCase())) {
      city = name;
      break;
    }
  }

  const wantsHotels =
    /\b(hotel|hotels|stay|stays|residence|residences|suite|suites|villa|villas|resort|resorts|book|room)\b/i.test(
      text,
    ) || Boolean(city);

  return { city, mode, wantsHotels };
}
