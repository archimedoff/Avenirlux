export const DESTINATIONS = [
  { name: "Dubai", countryCode: "AE", tag: "Skyline & desert", image: "photo-1512453979798-5ea266f8880c" },
  { name: "Paris", countryCode: "FR", tag: "Left Bank calm", image: "photo-1502602898657-3e91760cbb34" },
  { name: "Tokyo", countryCode: "JP", tag: "Urban refinement", image: "photo-1540959733332-eab4deabeeaf" },
  { name: "Maldives", countryCode: "MV", tag: "Overwater stillness", image: "photo-1514282401047-d79a71a590e8" },
  { name: "Singapore", countryCode: "SG", tag: "Garden city", image: "photo-1525625293386-3a8f3d9e3e1b" },
  { name: "Barcelona", countryCode: "ES", tag: "Mediterranean light", image: "photo-1539037116277-4db20889f2d4" },
  { name: "London", countryCode: "GB", tag: "Heritage & modernity", image: "photo-1513635269975-59663e0ac1ad" },
  { name: "New York", countryCode: "US", tag: "Manhattan pulse", image: "photo-1496442226666-8d4d0e62e6e9" },
  { name: "Bali", countryCode: "ID", tag: "Jungle serenity", image: "photo-1518548419970-58e3b4079ab2" },
  { name: "Milan", countryCode: "IT", tag: "Design capital", image: "photo-1513581166391-887a96ddeafd" },
  { name: "Chamonix", countryCode: "FR", tag: "Alpine escape", image: "photo-1476514525535-07fb3b4ae5f1" },
  { name: "Santorini", countryCode: "GR", tag: "Aegean horizons", image: "photo-1570077188670-e3a8d69ac5ff" },
] as const;

export type DestinationDefinition = (typeof DESTINATIONS)[number];

export function getDestinationByCity(city: string): DestinationDefinition | undefined {
  const normalized = city.trim().toLowerCase();
  return DESTINATIONS.find((d) => d.name.toLowerCase() === normalized);
}

export function resolveCountryCode(city: string): string | undefined {
  return getDestinationByCity(city)?.countryCode;
}

export function getDestinationCards() {
  return DESTINATIONS.map((d) => ({
    name: d.name,
    tag: d.tag,
    image: `https://images.unsplash.com/${d.image}?auto=format&fit=crop&w=900&q=82`,
  }));
}
