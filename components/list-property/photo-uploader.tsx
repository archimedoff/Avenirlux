"use client";

import { useCallback, useRef, useState } from "react";

import { useTranslations } from "@/lib/i18n/use-translations";


type Props = {
  cover: string;
  gallery: string[];
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
};

export function PhotoUploader({ cover, gallery, onCoverChange, onGalleryChange }: Props) {
  const { t } = useTranslations("listProperty");
  const { t: tc } = useTranslations("common");
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!cover) onCoverChange(url);
    else onGalleryChange([...gallery, url]);
    setUrlInput("");
  };

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
          if (!cover) onCoverChange(dataUrl);
          else onGalleryChange([...gallery, dataUrl]);
        };
        reader.readAsDataURL(file);
      });
    },
    [cover, gallery, onCoverChange, onGalleryChange],
  );

  const previews = [cover, ...gallery].filter(Boolean);

  return (
    <div className="space-y-4">
      <div
        className={`photo-dropzone ${dragOver ? "photo-dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <p className="text-sm text-[var(--foreground-muted)]">{t("fields.dropPhotos")}</p>
      </div>
      <div className="flex gap-2">
        <input
          className="input-premium flex-1"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={t("fields.urlFallback")}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
        />
        <button type="button" className="btn-secondary" onClick={addUrl}>
          {tc("add")}
        </button>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((src, i) => (
            <figure key={`${src}-${i}`} className="photo-preview">
              <img src={src} alt="" />
              {i === 0 ? (
                <span className="photo-preview__badge">{t("fields.coverImage")}</span>
              ) : (
                <button
                  type="button"
                  className="photo-preview__remove"
                  aria-label="Remove"
                  onClick={() => onGalleryChange(gallery.filter((g) => g !== src))}
                >
                  ×
                </button>
              )}
            </figure>
          ))}
        </div>
      )}
      <label className="dash-field">
        <span>{t("fields.coverImage")}</span>
        <input className="input-premium" value={cover} onChange={(e) => onCoverChange(e.target.value)} />
      </label>
    </div>
  );
}
