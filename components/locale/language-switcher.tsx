"use client";

import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/use-translations";

const LABELS: Record<Locale, string> = { en: "EN", ru: "RU" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useTranslations();

  return (
    <div
      className={`inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide transition-colors duration-300 ${
            locale === code
              ? "bg-[var(--luxury-ink)] text-white"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
          aria-pressed={locale === code}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
