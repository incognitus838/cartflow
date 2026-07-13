import "server-only";

import {
  getEmailProvider,
  getNotificationFromEmail,
  getTransactionalFromEmail,
  isEmailConfigured,
  parseFromAddress,
} from "@/lib/email/config";

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
  const provider = getEmailProvider();
  if (!isEmailConfigured() || !provider) {
    return {
      sent: false,
      error: "Email is not configured (set ZEPTOMAIL_SEND_TOKEN or RESEND_API_KEY).",
      skipped: true,
    };
  }

  const fromFormatted =
    input.from === "notification" ? getNotificationFromEmail() : getTransactionalFromEmail();

  if (provider === "zeptomail") {
    return sendViaZeptomail(input, fromFormatted);
  }

  return sendViaResend(input, fromFormatted);
}

async function sendViaZeptomail(
  input: SendEmailInput,
  fromFormatted: string,
): Promise<SendEmailResult> {
  const token = process.env.ZEPTOMAIL_SEND_TOKEN!.trim();
  const from = parseFromAddress(fromFormatted);
  const toName = input.to.split("@")[0]?.replace(/[._-]/g, " ") || "there";

  const body: Record<string, unknown> = {
    from: { address: from.address, name: from.name },
    to: [{ email_address: { address: input.to, name: toName } }],
    subject: input.subject,
    track_clicks: false,
    track_opens: false,
  };

  if (input.html) {
    body.htmlbody = input.html;
  } else {
    body.textbody = input.text;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    data?: Array<{ code?: string; message?: string }>;
    error?: { message?: string; details?: Array<{ message?: string }> };
    message?: string;
    request_id?: string;
  };

  if (!res.ok) {
    const detail = data.error?.details?.[0]?.message;
    const message = detail || data.error?.message || data.message || `Email delivery failed (${res.status}).`;
    return { sent: false, error: message };
  }

  return { sent: true, id: data.request_id };
}

async function sendViaResend(
  input: SendEmailInput,
  fromFormatted: string,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY!.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromFormatted,
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