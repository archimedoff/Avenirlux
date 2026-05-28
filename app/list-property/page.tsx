import type { Metadata } from "next";

import { ListPropertyWizard } from "@/components/list-property/list-property-wizard";

export const metadata: Metadata = {
  title: "List your property",
  description: "Submit your luxury residence for consideration on AvenirLux.",
};

export default function ListPropertyPage() {
  return (
    <main className="pb-16">
      <ListPropertyWizard />
    </main>
  );
}
