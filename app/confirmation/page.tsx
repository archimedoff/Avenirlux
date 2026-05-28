import { ConfirmationSuccess } from "@/components/confirmation-success";
import { countNights, formatUsd } from "@/lib/booking-utils";
import { calculateStayPricing } from "@/lib/reservation/pricing";
import { fetchHotelById } from "@/lib/hotels-data";

type ConfirmationPageProps = {
  searchParams: Promise<{
    hotelId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
    ref?: string;
  }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const hotel = params.hotelId
    ? await fetchHotelById(params.hotelId, {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: Number(params.guests || "2") || 2,
      })
    : null;
  const room = hotel?.rooms.find((r) => r.id === params.roomId) ?? hotel?.rooms[0];
  const nightly = room?.pricePerNight ?? hotel?.pricePerNight ?? 0;
  const pricing = calculateStayPricing(nightly, countNights(params.checkIn || "", params.checkOut || ""));

  return (
    <main className="flex min-h-[70vh] items-center justify-center pb-12">
      <ConfirmationSuccess
        fallbackRef={params.ref}
        hotelName={hotel?.name}
        hotelImage={hotel?.image}
        city={hotel?.city}
        roomName={room?.name}
        checkIn={params.checkIn}
        checkOut={params.checkOut}
        guests={Number(params.guests || "2") || 2}
        total={pricing.total}
      />
    </main>
  );
}
