"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { ConciergeUpsells } from "@/components/checkout/concierge-upsells";
import { PaymentStep } from "@/components/checkout/payment-step";
import { ReservationSummary } from "@/components/checkout/reservation-summary";
import { ReservationProgress } from "@/components/reservation-progress";
import { StripeProvider } from "@/components/stripe/stripe-provider";
import { CheckoutSkeleton } from "@/components/ui/checkout-skeleton";
import { buildStayQuery, countNights, formatUsd, generateConfirmationRef } from "@/lib/booking-utils";
import { cancelBooking, confirmCheckout, createCheckoutIntent } from "@/lib/bookings-api";
import { COUNTRIES } from "@/lib/countries";
import type { Hotel } from "@/lib/hotel-types";
import { calculateStayPricing } from "@/lib/reservation/pricing";
import {
  buildDraftFromStay,
  clearReservation,
  loadReservation,
  mergeGuestDetails,
  saveReservation,
} from "@/lib/reservation/store";
import type { CheckoutIntentResponse, GuestDetails, ReservationDraft } from "@/lib/reservation/types";
import { resolveSelectedUpsells } from "@/lib/reservation/upsells";

const ARRIVAL_TIMES = ["Flexible", "Before 14:00", "14:00 – 16:00", "16:00 – 18:00", "After 18:00", "Late night"];

type Step = "guest" | "enhancements" | "payment";

type Props = {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
};

export function CheckoutFlow({ hotel, checkIn, checkOut, guests, roomId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  const nights = countNights(checkIn, checkOut);

  const [step, setStep] = useState<Step>("guest");
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [specialRequests, setSpecialRequests] = useState("");
  const [arrivalTime, setArrivalTime] = useState("Flexible");
  const [conciergeNotes, setConciergeNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [intent, setIntent] = useState<CheckoutIntentResponse | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const pricing = useMemo(
    () => calculateStayPricing(nightly, nights, resolveSelectedUpsells(selectedUpsells)),
    [nightly, nights, selectedUpsells],
  );

  useEffect(() => {
    const draft = buildDraftFromStay({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      city: hotel.city,
      country: hotel.country,
      checkIn,
      checkOut,
      guests,
      roomId: room?.id || "",
      roomName: room?.name || "Suite",
      pricing,
      providerId: hotel.providerId,
      propertyId: hotel.providerId === "marketplace" ? hotel.id : undefined,
    });
    const stored = loadReservation();
    if (stored?.hotelId === hotel.id) {
      saveReservation({ ...draft, ...stored, pricing, status: "checkout" });
      if (stored.selectedUpsellIds) setSelectedUpsells(stored.selectedUpsellIds);
      if (stored.guest) {
        setFirstName(stored.guest.firstName);
        setLastName(stored.guest.lastName);
        setEmail(stored.guest.email);
        setPhone(stored.guest.phone);
        setCountry(stored.guest.country);
        setSpecialRequests(stored.guest.specialRequests || "");
        setArrivalTime(stored.guest.arrivalTime || "Flexible");
        setConciergeNotes(stored.guest.conciergeNotes || "");
      }
    } else {
      saveReservation({ ...draft, status: "checkout" });
    }
    if (session?.user?.email && !email) setEmail(session.user.email);
    setHydrated(true);
  }, [hotel, checkIn, checkOut, guests, room, pricing, session?.user?.email]);

  const buildReservation = useCallback(
    (guest: GuestDetails, extra?: Partial<ReservationDraft>): ReservationDraft => ({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      city: hotel.city,
      country: hotel.country,
      providerId: hotel.providerId,
      propertyId: hotel.providerId === "marketplace" ? hotel.id : undefined,
      checkIn,
      checkOut,
      guests,
      roomId: room?.id || "",
      roomName: room?.name || "Suite",
      pricing,
      selectedUpsellIds: selectedUpsells,
      guest,
      status: "payment",
      updatedAt: new Date().toISOString(),
      ...extra,
    }),
    [hotel, checkIn, checkOut, guests, room, pricing, selectedUpsells],
  );

  const onGuestSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const guest: GuestDetails = { firstName, lastName, email, phone, country, specialRequests: specialRequests || undefined, arrivalTime, conciergeNotes: conciergeNotes || undefined };
    mergeGuestDetails(guest);
    saveReservation(buildReservation(guest, { status: "checkout" }));
    setStep("enhancements");
  };

  const onEnhancementsContinue = async () => {
    setError("");
    const guest: GuestDetails = { firstName, lastName, email, phone, country, specialRequests: specialRequests || undefined, arrivalTime, conciergeNotes: conciergeNotes || undefined };
    const reservation = buildReservation(guest, { status: "payment" });
    saveReservation(reservation);
    setLoadingPayment(true);
    try {
      const result = (await createCheckoutIntent(reservation)) as CheckoutIntentResponse;
      setIntent(result);
      saveReservation({ ...reservation, bookingId: result.bookingId, confirmationRef: result.confirmationRef, paymentIntentId: result.paymentIntentId ?? undefined });
      setStep("payment");
    } catch {
      setError("Could not prepare payment. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const finalizeBooking = async (paymentIntentId?: string) => {
    if (!intent) return;
    setLoadingPayment(true);
    setError("");
    try {
      await confirmCheckout(intent.bookingId, paymentIntentId ?? intent.paymentIntentId ?? undefined);
      const guest: GuestDetails = { firstName, lastName, email, phone, country };
      const confirmed = buildReservation(guest, {
        status: "confirmed",
        confirmationRef: intent.confirmationRef,
        bookingId: intent.bookingId,
      });
      saveReservation(confirmed);
      const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
      clearReservation();
      router.push(`/confirmation?${q}&ref=${intent.confirmationRef}&bookingId=${intent.bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment confirmation failed");
      setStep("payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  if (!hydrated) return <CheckoutSkeleton />;

  const progressStep = step === "guest" ? "checkout" : step === "enhancements" ? "checkout" : "payment";

  return (
    <div className="page-enter grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <section className="glass-card space-y-6 p-6 sm:p-8">
        <ReservationProgress current={progressStep as "checkout" | "payment" | "confirmation"} />
        {error && (
          <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {error}
          </div>
        )}

        {step === "guest" && (
          <form onSubmit={onGuestSubmit} className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Guest details</h2>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">Who will be staying with us?</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2"><span className="eyebrow">First name</span><input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-premium !mt-0" autoComplete="given-name" /></label>
              <label className="flex flex-col gap-2"><span className="eyebrow">Last name</span><input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-premium !mt-0" autoComplete="family-name" /></label>
            </div>
            <label className="flex flex-col gap-2"><span className="eyebrow">Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium !mt-0" autoComplete="email" /></label>
            <label className="flex flex-col gap-2"><span className="eyebrow">Phone</span><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium !mt-0" autoComplete="tel" /></label>
            <label className="flex flex-col gap-2"><span className="eyebrow">Country</span><select value={country} onChange={(e) => setCountry(e.target.value)} className="input-premium !mt-0">{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="flex flex-col gap-2"><span className="eyebrow">Estimated arrival</span><select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="input-premium !mt-0">{ARRIVAL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label className="flex flex-col gap-2"><span className="eyebrow">Special requests</span><textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} className="input-premium !mt-0 resize-none" placeholder="Dietary preferences, bedding, celebrations…" /></label>
            <label className="flex flex-col gap-2"><span className="eyebrow">Concierge notes</span><textarea value={conciergeNotes} onChange={(e) => setConciergeNotes(e.target.value)} rows={3} className="input-premium !mt-0 resize-none" placeholder="Transfers, reservations, private experiences…" /></label>
            <button type="submit" className="btn-primary w-full py-3.5">Continue</button>
          </form>
        )}

        {step === "enhancements" && (
          <div className="space-y-6">
            <ConciergeUpsells selected={selectedUpsells} onChange={setSelectedUpsells} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep("guest")} className="btn-secondary flex-1">Back</button>
              <button type="button" onClick={onEnhancementsContinue} disabled={loadingPayment} className="btn-primary flex-[2] py-3.5 disabled:opacity-60">
                {loadingPayment ? "Preparing…" : "Proceed to payment"}
              </button>
            </div>
          </div>
        )}

        {step === "payment" && intent && (
          <StripeProvider publishableKey={intent.publishableKey} clientSecret={intent.clientSecret}>
            <PaymentStep
              totalLabel={formatUsd(pricing.total)}
              mockMode={intent.mockMode}
              onMockPay={() => void finalizeBooking()}
              onSuccess={(id) => void finalizeBooking(id)}
              onError={setError}
            />
            <button type="button" onClick={() => setStep("enhancements")} className="btn-ghost mt-4 w-full text-sm">← Back to enhancements</button>
          </StripeProvider>
        )}
      </section>

      <ReservationSummary hotel={hotel} roomName={room?.name || "Suite"} checkIn={checkIn} checkOut={checkOut} guests={guests} pricing={pricing} />

      {loadingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card px-8 py-6 text-center page-enter">
            <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-[var(--luxury-gold-muted)] border-t-[var(--luxury-gold)]" />
            <p className="text-sm font-medium">Securing your reservation…</p>
          </div>
        </div>
      )}
    </div>
  );
}
