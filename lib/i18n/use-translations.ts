"use client";

import { useMemo } from "react";

import { useLocaleContext } from "@/lib/i18n/locale-provider";

type Namespace = "common" | "nav" | "auth" | "concierge" | "host" | "listProperty";

export function useTranslations(namespace?: Namespace) {
  const { t, locale, setLocale } = useLocaleContext();

  return useMemo(() => {
    const translate = (key: string, values?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return t(fullKey, values);
    };
    return { t: translate, locale, setLocale };
  }, [t, locale, setLocale, namespace]);
}
