import type { BookingEmailPayload, BookingEmailTemplate } from "@/lib/booking/email-service";
import { formatUsd } from "@/lib/booking-utils";

const BRAND = {
  bg: "#080807",
  gold: "#C9A962",
  text: "#F5F2EB",
  muted: "#A8A29A",
};

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;background:${BRAND.bg};font-family:Georgia,'Times New Roman',serif;color:${BRAND.text};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#111110;border:1px solid #2a2826;border-radius:12px;overflow:hidden;">
<tr><td style="padding:32px 28px 12px;text-align:center;">
<p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND.gold};">AvenirLux</p>
<h1 style="margin:16px 0 0;font-size:28px;font-weight:400;letter-spacing:-0.02em;color:${BRAND.text};">${title}</h1>
</td></tr>
<tr><td style="padding:8px 28px 32px;font-size:15px;line-height:1.65;color:${BRAND.muted};">${body}</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #2a2826;font-size:12px;color:#6b6560;text-align:center;">
Quiet luxury travel · concierge@avenirlux.com
</td></tr>
</table></td></tr></table></body></html>`;
}

function stayDetails(p: BookingEmailPayload) {
  return `<p style="margin:0 0 16px;">Dear ${p.guestName},</p>
<p style="margin:0 0 20px;"><strong style="color:${BRAND.text};">${p.hotelName}</strong>${p.city ? ` · ${p.city}` : ""}<br/>
${p.checkIn} → ${p.checkOut}<br/>Reference <span style="color:${BRAND.gold};font-family:monospace;">${p.confirmationRef}</span><br/>
Total ${formatUsd(p.total)}</p>`;
}

export function renderBookingEmail(template: BookingEmailTemplate, payload: BookingEmailPayload): string {
  switch (template) {
    case "booking_confirmation":
      return layout(
        "Your stay is confirmed",
        `${stayDetails(payload)}<p style="margin:0;">Our concierge team will coordinate every detail before your arrival. Reply to this email for any requests.</p>`,
      );
    case "booking_cancelled":
      return layout(
        "Reservation cancelled",
        `${stayDetails(payload)}<p style="margin:0;">Your reservation has been cancelled. If a refund applies, it will appear within 5–10 business days.</p>`,
      );
    case "host_new_booking":
      return layout(
        "New guest reservation",
        `<p style="margin:0 0 16px;">A new paid reservation was confirmed.</p>
${stayDetails(payload)}<p style="margin:0;">Sign in to your host dashboard to review guest details and coordinate arrival.</p>`,
      );
    default:
      return layout("AvenirLux", stayDetails(payload));
  }
}
