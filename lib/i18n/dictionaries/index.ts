import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";
import { ru } from "@/lib/i18n/dictionaries/ru";
import type { Locale } from "@/lib/i18n/config";

export const dictionaries: Record<Locale, Dictionary> = { en, ru };

export type { Dictionary };
