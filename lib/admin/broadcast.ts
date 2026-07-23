import "server-only";

import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { SellerBroadcastEmail } from "@/emails/seller-broadcast";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { getAppUrl } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/render-template";

export type BroadcastAudience =
  | "all_owners"
  | { plan?: BusinessPlan; approvalStatus?: StoreApprovalStatus };

export type BroadcastInput = {
  subject: string;
  body: string;
  audience: "all_owners" | "plan" | "approval";
  plan?: BusinessPlan;
  approvalStatus?: StoreApprovalStatus;
  ctaLabel?: string;
  ctaHref?: string;
};

function splitParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export async function listSellerRecipients(input: BroadcastInput) {
  const where: {
    deletedAt: null;
    plan?: BusinessPlan;
    approvalStatus?: StoreApprovalStatus;
  } = { deletedAt: null };

  if (input.audience === "plan" && input.plan) {
    where.plan = input.plan;
  }
  if (input.audience === "approval" && input.approvalStatus) {
    where.approvalStatus = input.approvalStatus;
  }

  const stores = await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  // One email per owner (prefer first store name for personalisation)
  const byEmail = new Map<
    string,
    { email: string; name: string; storeName: string; businessId: string }
  >();

  for (const store of stores) {
    const email = store.owner.email.trim().toLowerCase();
    if (!email || byEmail.has(email)) continue;
    byEmail.set(email, {
      email: store.owner.email.trim(),
      name: store.owner.name,
      storeName: store.name,
      businessId: store.id,
    });
  }

  return Array.from(byEmail.values());
}

export async function sendSellerBroadcast(input: BroadcastInput) {
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (subject.length < 3) throw new Error("Subject must be at least 3 characters.");
  if (body.length < 10) throw new Error("Message body is too short.");

  const recipients = await listSellerRecipients(input);
  if (recipients.length === 0) {
    return { sent: 0, failed: 0, total: 0, errors: [] as string[] };
  }
  if (recipients.length > 2000) {
    throw new Error(
      `Audience is ${recipients.length} owners. Maximum 2,000 per send. Narrow the audience.`,
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

  // Sequential with small delay — safe for hundreds; avoids Resend rate limits
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

    // ~2.5 req/s soft limit
    await new Promise((r) => setTimeout(r, 350));
  }

  return {
    sent,
    failed,
    total: recipients.length,
    errors: errors.slice(0, 20),
  };
}
