const DRAFT_KEY = "avenirlux-listing-photos-v1";

export type PhotoDraft = {
  image: string;
  gallery: string[];
};

export function loadPhotoDraft(): PhotoDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PhotoDraft;
    if (typeof parsed.image !== "string" || !Array.isArray(parsed.gallery)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePhotoDraft(draft: PhotoDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function clearPhotoDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
