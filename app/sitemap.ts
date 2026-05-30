import type { MetadataRoute } from "next";

import { getDestinations } from "@/lib/hotels-service";
import { getSiteUrl } from "@/lib/site";
import { DESTINATIONS } from "@/lib/liteapi/destinations";

const STATIC_PATHS = ["", "/hotels", "/concierge", "/list-property", "/auth"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : 0.7,
  }));

  const cityEntries = DESTINATIONS.map((d) => ({
    url: `${base}/destinations/${encodeURIComponent(d.name.toLowerCase())}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...cityEntries];
}
