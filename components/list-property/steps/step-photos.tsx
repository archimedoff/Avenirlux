"use client";

import { PhotoUploader } from "@/components/list-property/photo-uploader";
import type { ListingFormState } from "@/lib/listing/types";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepPhotos({ form, onChange }: Props) {
  return (
    <PhotoUploader
      cover={form.image}
      gallery={form.gallery}
      onCoverChange={(image) => onChange({ image })}
      onGalleryChange={(gallery) => onChange({ gallery })}
    />
  );
}
