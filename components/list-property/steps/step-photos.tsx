"use client";

import { PhotoUploader } from "@/components/list-property/photo-uploader";
import type { ListingFormState } from "@/lib/listing/types";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
  propertyId?: string;
};

export function StepPhotos({ form, onChange, propertyId }: Props) {
  return (
    <PhotoUploader
      cover={form.image}
      gallery={form.gallery}
      onCoverChange={(image) => onChange({ image })}
      onGalleryChange={(gallery) => onChange({ gallery })}
      propertyId={propertyId}
      persistDraft={!propertyId}
    />
  );
}
