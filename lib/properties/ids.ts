export const AVENIR_PROPERTY_PREFIX = "alx_";

export function toPublicPropertyId(id: string): string {
  return id.startsWith(AVENIR_PROPERTY_PREFIX) ? id : `${AVENIR_PROPERTY_PREFIX}${id}`;
}

export function fromPublicPropertyId(id: string): string {
  return id.startsWith(AVENIR_PROPERTY_PREFIX) ? id.slice(AVENIR_PROPERTY_PREFIX.length) : id;
}

export function isAvenirPropertyId(id: string): boolean {
  return id.startsWith(AVENIR_PROPERTY_PREFIX);
}
