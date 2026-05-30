"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchStorageConfigured,
  usePropertyImageUpload,
} from "@/lib/hooks/use-property-image-upload";
import {
  clearPhotoDraft,
  loadPhotoDraft,
  savePhotoDraft,
} from "@/lib/listing/photo-draft-storage";
import { MAX_PROPERTY_IMAGES } from "@/lib/storage/property-image-limits";
import { validateImageFile, validateImageUrl } from "@/lib/storage/validate-image-file";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  cover: string;
  gallery: string[];
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
  propertyId?: string;
  persistDraft?: boolean;
};

function orderedImages(cover: string, gallery: string[]) {
  return [cover, ...gallery].filter(Boolean);
}

function applyOrdered(
  images: string[],
  onCoverChange: (url: string) => void,
  onGalleryChange: (urls: string[]) => void,
) {
  const [first = "", ...rest] = images;
  onCoverChange(first);
  onGalleryChange(rest);
}

export function PhotoUploader({
  cover,
  gallery,
  onCoverChange,
  onGalleryChange,
  propertyId,
  persistDraft = true,
}: Props) {
  const { t } = useTranslations("listProperty");
  const { uploadFile, uploading, error, queue } = usePropertyImageUpload(propertyId);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  const images = orderedImages(cover, gallery);
  const atLimit = images.length >= MAX_PROPERTY_IMAGES;

  useEffect(() => {
    void fetchStorageConfigured().then(setStorageReady);
  }, []);

  useEffect(() => {
    if (!persistDraft || hydrated.current) return;
    hydrated.current = true;
    const draft = loadPhotoDraft();
    if (draft && (draft.image || draft.gallery.length) && images.length === 0) {
      applyOrdered(orderedImages(draft.image, draft.gallery), onCoverChange, onGalleryChange);
    }
  }, [persistDraft, images.length, onCoverChange, onGalleryChange]);

  useEffect(() => {
    if (!persistDraft || !hydrated.current) return;
    savePhotoDraft({ image: cover, gallery });
  }, [cover, gallery, persistDraft]);

  const setImages = useCallback(
    (next: string[]) => {
      applyOrdered(next.slice(0, MAX_PROPERTY_IMAGES), onCoverChange, onGalleryChange);
    },
    [onCoverChange, onGalleryChange],
  );

  const appendUrl = (url: string) => {
    if (!validateImageUrl(url)) {
      setLocalError(t("photos.errors.invalidUrl"));
      return;
    }
    if (atLimit) {
      setLocalError(t("photos.errors.tooMany", { max: MAX_PROPERTY_IMAGES }));
      return;
    }
    setLocalError(null);
    setImages([...images, url]);
    setUrlInput("");
  };

  const onFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setLocalError(null);
      let accumulated = [...images];
      for (const file of Array.from(files)) {
        if (accumulated.length >= MAX_PROPERTY_IMAGES) {
          setLocalError(t("photos.errors.tooMany", { max: MAX_PROPERTY_IMAGES }));
          break;
        }
        const validation = validateImageFile(file, accumulated.length);
        if (validation) {
          setLocalError(t(`photos.errors.${validation}`, { max: MAX_PROPERTY_IMAGES }));
          continue;
        }
        if (storageReady === false) {
          setLocalError(t("photos.errors.storageUnavailable"));
          break;
        }
        const url = await uploadFile(file);
        if (url) {
          accumulated = [...accumulated, url].slice(0, MAX_PROPERTY_IMAGES);
          setImages(accumulated);
        }
      }
    },
    [images, cover, gallery, storageReady, uploadFile, setImages, t],
  );

  const removeAt = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [img] = next.splice(index, 1);
    next.unshift(img);
    setImages(next);
  };

  const displayError = localError || error;

  return (
    <div className="photo-uploader space-y-5">
      {storageReady === false ? (
        <p className="photo-uploader__notice">{t("photos.storageFallback")}</p>
      ) : null}

      <div
        className={`photo-dropzone ${dragOver ? "photo-dropzone--active" : ""} ${atLimit ? "photo-dropzone--disabled" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!atLimit) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!atLimit) void onFiles(e.dataTransfer.files);
        }}
        onClick={() => !atLimit && inputRef.current?.click()}
        role="button"
        tabIndex={atLimit ? -1 : 0}
        aria-disabled={atLimit}
        onKeyDown={(e) => e.key === "Enter" && !atLimit && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="sr-only"
          disabled={atLimit || uploading}
          onChange={(e) => void onFiles(e.target.files)}
        />
        <div className="photo-dropzone__inner">
          <span className="photo-dropzone__icon" aria-hidden>
            ◇
          </span>
          <p className="photo-dropzone__title">
            {uploading ? t("photos.uploading") : t("fields.dropPhotos")}
          </p>
          <p className="photo-dropzone__hint">{t("photos.limits")}</p>
          <p className="photo-dropzone__count">
            {t("photos.count", { current: images.length, max: MAX_PROPERTY_IMAGES })}
          </p>
        </div>
      </div>

      {queue.length > 0 ? (
        <ul className="photo-upload-queue" aria-live="polite">
          {queue.map((item) => (
            <li key={item.id} className={`photo-upload-queue__item photo-upload-queue__item--${item.status}`}>
              <span className="truncate text-sm">{item.name}</span>
              <div className="photo-upload-queue__bar">
                <div
                  className="photo-upload-queue__fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.status === "error" ? (
                <span className="text-xs text-red-700">{item.error}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {displayError ? (
        <p className="photo-uploader__error" role="alert">
          {displayError}
        </p>
      ) : null}

      <div className="photo-url-fallback">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
          {t("photos.urlOptional")}
        </p>
        <div className="mt-2 flex gap-2">
          <input
            className="input-premium flex-1"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t("fields.urlFallback")}
            disabled={atLimit}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), appendUrl(urlInput.trim()))}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={atLimit || !urlInput.trim()}
            onClick={() => appendUrl(urlInput.trim())}
          >
            {t("photos.addUrl")}
          </button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, i) => (
            <figure key={`${src}-${i}`} className={`photo-preview ${i === 0 ? "photo-preview--cover" : ""}`}>
              <img src={src} alt="" loading="lazy" />
              {i === 0 ? (
                <span className="photo-preview__badge">{t("fields.coverImage")}</span>
              ) : (
                <div className="photo-preview__actions">
                  <button type="button" className="photo-preview__action" onClick={() => makeCover(i)}>
                    {t("photos.setCover")}
                  </button>
                  <button
                    type="button"
                    className="photo-preview__remove"
                    aria-label={t("photos.remove")}
                    onClick={() => removeAt(i)}
                  >
                    ×
                  </button>
                </div>
              )}
              {i === 0 ? (
                <button
                  type="button"
                  className="photo-preview__remove photo-preview__remove--cover"
                  aria-label={t("photos.remove")}
                  onClick={() => removeAt(0)}
                >
                  ×
                </button>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-[var(--foreground-muted)] py-6">{t("photos.empty")}</p>
      )}
    </div>
  );
}

export { clearPhotoDraft };
