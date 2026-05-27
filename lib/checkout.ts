type BookingComParams = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function buildBookingComUrl(params: BookingComParams): string {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", params.city);
  url.searchParams.set("checkin", params.checkIn);
  url.searchParams.set("checkout", params.checkOut);
  url.searchParams.set("group_adults", String(Math.max(1, params.guests)));
  url.searchParams.set("no_rooms", "1");
  url.searchParams.set("group_children", "0");
  return url.toString();
}
