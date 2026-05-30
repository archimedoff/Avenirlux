export type ConciergeUpsell = {
  id: string;
  label: string;
  description: string;
  price: number;
  category: "transport" | "dining" | "wellness" | "experience";
};

export const CONCIERGE_UPSELLS: ConciergeUpsell[] = [
  { id: "airport-transfer", label: "Private airport transfer", description: "Luxury sedan meet-and-greet with bottled water and Wi‑Fi.", price: 185, category: "transport" },
  { id: "late-checkout", label: "Late checkout until 4pm", description: "Extend your departure — subject to availability.", price: 95, category: "experience" },
  { id: "champagne-arrival", label: "Champagne arrival amenity", description: "Chilled vintage champagne and artisan chocolates in-room.", price: 120, category: "dining" },
  { id: "spa-couple", label: "Couples spa ritual", description: "90-minute signature treatment for two, pre-arranged.", price: 320, category: "wellness" },
  { id: "private-dinner", label: "Private in-residence dinner", description: "Chef-prepared tasting menu for two on your terrace.", price: 450, category: "dining" },
  { id: "city-concierge", label: "Dedicated day concierge", description: "Full-day personal concierge for reservations and experiences.", price: 280, category: "experience" },
];

export function getUpsellById(id: string) {
  return CONCIERGE_UPSELLS.find((u) => u.id === id);
}

export function resolveSelectedUpsells(ids: string[]) {
  return ids.map((id) => getUpsellById(id)).filter(Boolean) as ConciergeUpsell[];
}
