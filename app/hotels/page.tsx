import { HotelsResults } from "@/app/hotels/hotels-results";

type HotelsPageProps = {
  searchParams: Promise<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;

  return (
    <main className="space-y-6 pb-8">
      <HotelsResults city={params.city} checkIn={params.checkIn} checkOut={params.checkOut} guests={params.guests} />
    </main>
  );
}
