import type { ConciergeStreamEvent, TripMode } from "@/lib/concierge/types";
import type { ParsedIntent } from "@/lib/concierge/intent";
import type { ConciergeHotelPick } from "@/lib/concierge/types";

export type ConciergeContext = {
  message: string;
  intent: ParsedIntent;
  hotels: ConciergeHotelPick[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
  mode: TripMode;
};

export interface ConciergeProvider {
  readonly id: string;
  stream(context: ConciergeContext): AsyncGenerator<ConciergeStreamEvent>;
}
