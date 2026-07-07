import "server-only";

import { getNotificationFromEmail, getTransactionalFromEmail, isEmailConfigured } from "@/lib/email/config";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: "transactional" | "notification";
};

export type SendEmailResult =
  | { sent: true; id?: string }
  | { sent: false; error: string; skipped?: boolean };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { sent: false, error: "RESEND_API_KEY is not configured.", skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from =
    input.from === "notification" ? getNotificationFromEmail() : getTransactionalFromEmail();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? undefined,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    return { sent: false, error: data.message || `Email delivery failed (${res.status}).` };
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { sent: true, id: data.id };
}