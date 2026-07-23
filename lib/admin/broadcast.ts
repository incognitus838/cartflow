import "server-only";

import { SellerBroadcastEmail } from "@/emails/seller-broadcast";
import {
  listSellerRecipients,
  type BroadcastAudienceInput,
} from "@/lib/admin/broadcast-recipients";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { getAppUrl } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/render-template";

export type BroadcastInput = BroadcastAudienceInput & {
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Final send list (subset of audience). Case-insensitive emails. */
  includeEmails?: string[];
  /** Remove these from audience before send. Ignored when includeEmails is set. */
  excludeEmails?: string[];
};

export type {
  BroadcastAudienceKind,
  BroadcastAudienceInput,
} from "@/lib/admin/broadcast-recipients";
export {
  listSellerRecipients,
  countSellerRecipients,
} from "@/lib/admin/broadcast-recipients";

function splitParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export async function sendSellerBroadcast(input: BroadcastInput) {
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (subject.length < 3) throw new Error("Subject must be at least 3 characters.");
  if (body.length < 10) throw new Error("Message body is too short.");

  const audience = await listSellerRecipients(input);
  const byEmail = new Map(
    audience.map((r) => [r.email.trim().toLowerCase(), r] as const),
  );

  let recipients = audience;
  // When includeEmails is provided (including []), only that curated set is used.
  if (input.includeEmails !== undefined) {
    const include = new Set(
      input.includeEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
    );
    recipients = [];
    for (const email of include) {
      const row = byEmail.get(email);
      if (row) recipients.push(row);
    }
  } else if (input.excludeEmails !== undefined) {
    const exclude = new Set(
      input.excludeEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
    );
    recipients = audience.filter((r) => !exclude.has(r.email.trim().toLowerCase()));
  }

  if (recipients.length === 0) {
    if (input.includeEmails !== undefined || input.excludeEmails !== undefined) {
      throw new Error("No recipients left to send to. Add addresses back or change the audience.");
    }
    return { sent: 0, failed: 0, total: 0, errors: [] as string[] };
  }
  if (recipients.length > 2000) {
    throw new Error(
      `Audience is ${recipients.length} owners. Maximum 2,000 per send. Narrow the audience or remove more addresses.`,
    );
  }

  const appUrl = getAppUrl();
  const paragraphs = splitParagraphs(body);
  const cta =
    input.ctaLabel && input.ctaHref
      ? { label: input.ctaLabel.trim(), href: input.ctaHref.trim() }
      : { label: "Open dashboard", href: `${appUrl}/dashboard` };

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    try {
      const { html, text } = await renderEmailTemplate(
        SellerBroadcastEmail({
          ownerName: recipient.name,
          storeName: recipient.storeName,
          subjectTitle: subject,
          bodyParagraphs: paragraphs,
          cta,
          appUrl,
        }),
      );

      const result = await sendEmail({
        to: recipient.email,
        subject,
        text,
        html,
        from: "transactional",
      });

      if (result.sent) {
        sent += 1;
        await prisma.notificationLog.create({
          data: {
            businessId: recipient.businessId,
            channel: "EMAIL",
            recipient: recipient.email,
            subject,
            body: text,
            status: "SENT",
          },
        });
      } else {
        failed += 1;
        errors.push(`${recipient.email}: ${result.error}`);
        await prisma.notificationLog.create({
          data: {
            businessId: recipient.businessId,
            channel: "EMAIL",
            recipient: recipient.email,
            subject,
            body: text,
            status: "FAILED",
            error: result.error,
          },
        });
      }
    } catch (error) {
      failed += 1;
      errors.push(
        `${recipient.email}: ${error instanceof Error ? error.message : "Send failed"}`,
      );
    }

    await new Promise((r) => setTimeout(r, 350));
  }

  return {
    sent,
    failed,
    total: recipients.length,
    errors: errors.slice(0, 20),
  };
}
