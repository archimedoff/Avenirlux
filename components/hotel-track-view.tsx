"use client";

import { useEffect } from "react";

import { trackRecentlyViewed } from "@/lib/recently-viewed";

type Props = {
  id: string;
  name: string;
  image: string;
  city: string;
};

export function HotelTrackView({ id, name, image, city }: Props) {
  useEffect(() => {
    trackRecentlyViewed({ id, name, image, city });
  }, [id, name, image, city]);
  return null;
}
