import { redirect } from "next/navigation";

type LegacyHotelDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LegacyHotelDetailPage({ params }: LegacyHotelDetailPageProps) {
  const { id } = await params;
  redirect(`/hotel/${id}`);
}
