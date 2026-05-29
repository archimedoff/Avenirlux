export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "avenirlux_locale";

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
