export function parseOAuthName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = name?.trim();
  if (!trimmed) return { firstName: "Guest", lastName: "Member" };
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "Member" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
