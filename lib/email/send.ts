import "server-only";

import { Resend } from "resend";

import { getEmailFrom, isEmailConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY!);
  return resend;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const client = getResend();
  if (!client) return { sent: false, error: "Email not configured" };

  try {
    const result = await client.emails.send({
      from: getEmailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo ?? "concierge@avenirlux.com",
    });
    if (result.error) {
      logger.error("email.send.failed", { error: result.error.message, to: input.to });
      return { sent: false, error: result.error.message };
    }
    return { sent: true, id: result.data?.id };
  } catch (err) {
    logger.error("email.send.exception", { error: String(err), to: input.to });
    return { sent: false, error: String(err) };
  }
}
