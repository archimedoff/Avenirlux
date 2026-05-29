import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export type TranslationValues = Record<string, string | number>;

export function createTranslator(dictionary: Dictionary) {
  return function t(key: string, values?: TranslationValues): string {
    const parts = key.split(".");
    let node: unknown = dictionary;
    for (const part of parts) {
      if (node && typeof node === "object" && part in (node as object)) {
        node = (node as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    if (typeof node !== "string") return key;
    if (!values) return node;
    return node.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
  };
}

export type Translator = ReturnType<typeof createTranslator>;
