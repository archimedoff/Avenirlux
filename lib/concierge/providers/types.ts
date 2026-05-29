import type { ParsedIntent } from "@/lib/concierge/intent";
import type { ConciergeHotelPick, TripMode } from "@/lib/concierge/types";

export type ConciergeProviderContext = {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  mode: TripMode;
  intent: ParsedIntent;
  hotels: ConciergeHotelPick[];
};

export interface ConciergeProvider {
  readonly id: string;
  streamReply(context: ConciergeProviderContext): AsyncGenerator<string, void, unknown>;
}
