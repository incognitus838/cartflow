import "server-only";

import { SellerBroadcastEmail } from "@/emails/seller-broadcast";
import type { BroadcastInput } from "@/lib/admin/broadcast";
import { listSellerRecipients } from "@/lib/admin/broadcast-recipients";
import { createAdminJob, getAdminJob, updateAdminJob } from "@/lib/admin/jobs";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { getAppUrl } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/render-template";

function splitParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export async function resolveBroadcastRecipients(input: BroadcastInput) {
  const audience = await listSellerRecipients(input);
  const byEmail = new Map(
    audience.map((r) => [r.email.trim().toLowerCase(), r] as const),
  );

  let recipients = audience;
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

  return recipients;
}

export async function enqueueSellerBroadcast(
  createdById: string,
  input: BroadcastInput,
) {
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (subject.length < 3) throw new Error("Subject must be at least 3 characters.");
  if (body.length < 10) throw new Error("Message body is too short.");

  const recipients = await resolveBroadcastRecipients(input);
  if (recipients.length === 0) {
    throw new Error("No recipients left to send to. Add addresses back or change the audience.");
  }
  if (recipients.length > 2000) {
    throw new Error(
      `Audience is ${recipients.length} owners. Maximum 2,000 per send. Narrow the audience or remove more addresses.`,
    );
  }

  const job = await createAdminJob({
    type: "SELLER_BROADCAST",
    createdById,
    total: recipients.length,
    payload: {
      input: {
        subject,
        body,
        audience: input.audience,
        plan: input.plan,
        approvalStatus: input.approvalStatus,
        ctaLabel: input.ctaLabel,
        ctaHref: input.ctaHref,
      },
      recipients,
    },
  });

  return job;
}

export async function processBroadcastJob(jobId: string) {
  const job = await getAdminJob(jobId);
  if (!job) return;
  if (job.status === "COMPLETED" || job.status === "FAILED") return;

  await updateAdminJob(jobId, { status: "RUNNING" });

  const payload = job.payload as {
    input: BroadcastInput;
    recipients: Array<{
      email: string;
      name: string;
      storeName: string;
      businessId: string;
    }>;
  };

  const input = payload.input;
  const recipients = payload.recipients ?? [];
  const subject = input.subject.trim();
  const body = input.body.trim();
  const appUrl = getAppUrl();
  const paragraphs = splitParagraphs(body);
  const hasCtaFields = input.ctaLabel !== undefined || input.ctaHref !== undefined;
  const cta =
    input.ctaLabel && input.ctaHref
      ? { label: input.ctaLabel.trim(), href: input.ctaHref.trim() }
      : hasCtaFields
        ? null
        : { label: "Open dashboard", href: `${appUrl}/dashboard` };

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
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
        success += 1;
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

    await updateAdminJob(jobId, {
      processed: i + 1,
      success,
      failed,
      errors: errors.slice(0, 20),
    });

    await new Promise((r) => setTimeout(r, 350));
  }

  await updateAdminJob(jobId, {
    status: "COMPLETED",
    processed: recipients.length,
    success,
    failed,
    errors: errors.slice(0, 20),
  });
}
