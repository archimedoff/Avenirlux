"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { buildStayQuery, defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import { DESTINATIONS } from "@/lib/liteapi/destinations";

type Props = {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialRooms?: number;
};

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];
const roomOptions = [1, 2, 3, 4];

export function LuxuryHotelSearch({
  initialCity = "",
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialRooms = 1,
}: Props) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn || defaultCheckIn());
  const [checkOut, setCheckOut] = useState(initialCheckOut || defaultCheckOut());
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minCheckOut = useMemo(() => {
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [checkIn]);

  useEffect(() => {
    setCity(initialCity);
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    setGuests(initialGuests);
    setRooms(initialRooms);
  }, [initialCity, initialCheckIn, initialCheckOut, initialGuests, initialRooms]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/hotels?${buildStayQuery({ city, checkIn, checkOut, guests, rooms })}`);
  };

  return (
    <form onSubmit={onSubmit} className="hotels-search-form glass-search">
      <div className="hotels-search-form__grid">
        <label className="hotels-search-form__field">
          <span className="hotels-search-form__label">Destination</span>
          <input
            type="text"
            list="avenirlux-cities"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or region"
            className="input-premium hotels-search-form__input"
          />
          <datalist id="avenirlux-cities">
            {DESTINATIONS.map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>
        </label>
        <label className="hotels-search-form__field">
          <span className="hotels-search-form__label">Check in</span>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-premium hotels-search-form__input" />
        </label>
        <label className="hotels-search-form__field">
          <span className="hotels-search-form__label">Check out</span>
          <input type="date" min={minCheckOut} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-premium hotels-search-form__input" />
        </label>
        <label className="hotels-search-form__field">
          <span className="hotels-search-form__label">Guests</span>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-premium hotels-search-form__input">
            {guestOptions.map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </label>
        <label className="hotels-search-form__field">
          <span className="hotels-search-form__label">Rooms</span>
          <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className="input-premium hotels-search-form__input">
            {roomOptions.map((n) => (
              <option key={n} value={n}>{n} room{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </label>
        <div className="hotels-search-form__submit">
          <button type="submit" className="btn-primary h-[48px] w-full">Search residences</button>
        </div>
      </div>
    </form>
  );
}
