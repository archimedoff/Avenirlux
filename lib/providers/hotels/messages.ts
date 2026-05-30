import type { HotelSearchErrorCode } from "@/lib/providers/hotels/types";

export function getHotelSearchErrorTitle(code?: HotelSearchErrorCode): string {
  switch (code) {
    case "timeout":
      return "Our partners are taking longer than usual";
    case "rate_limit":
      return "Search is temporarily busy";
    case "partial":
      return "Limited availability from some partners";
    case "unconfigured":
      return "Live hotel inventory is not configured";
    default:
      return "We could not reach our hotel partners";
  }
}
