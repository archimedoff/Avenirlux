import type { Metadata } from "next";

import { ConciergeChat } from "@/components/concierge/concierge-chat";

export const metadata: Metadata = {
  title: "AI Concierge",
  description:
    "Your private AvenirLux AI concierge — luxury destinations, hotel recommendations, itineraries, and hidden gems.",
  openGraph: {
    title: "AI Concierge · AvenirLux",
    description: "Ultra-premium luxury travel counsel, powered by live hotel availability.",
  },
};

export default function ConciergePage() {
  return (
    <div className="concierge-page">
      <div className="concierge-page__frame glass-card">
        <ConciergeChat fullPage />
      </div>
    </div>
  );
}
