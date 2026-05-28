import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const STATIC_PATHS = [
  "",
  "/hotels",
  "/list-property",
  "/auth",
  "/account",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
