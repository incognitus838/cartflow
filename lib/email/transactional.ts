import "server-only";

import { StoreApprovedEmail } from "@/emails/store-approved";
import { StoreRejectedEmail } from "@/emails/store-rejected";
import { TeamInviteEmail } from "@/emails/team-invite";
import { WelcomeEmail } from "@/emails/welcome";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { getAppUrl } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/render-template";
import { presetLabel } from "@/lib/dashboard/nav";

const INVITE_TTL_DAYS = 7;

type EmailPayload = {
  recipient: string;
  subject: string;
  body: string;
  html: string;
  businessId?: string;
};

async function logTransactionalEmail(
  payload: EmailPayload,
  result: Awaited<ReturnType<typeof sendEmail>>,
) {
  try {
    await prisma.notificationLog.create({
      data: {
        businessId: payload.businessId,
        channel: "EMAIL",
        recipient: payload.recipient,
        subject: payload.subject,
        body: payload.body,
        status: result.sent ? "SENT" : "FAILED",
        error: result.sent ? null : result.error,
      },
    });
  } catch {
    /* logging must not break flows */
  }
}

function queueTransactionalEmail(build: () => Promise<EmailPayload>) {
  void (async () => {
    try {
      const payload = await build();
      const result = await sendEmail({
        to: payload.recipient,
        subject: payload.subject,
        text: payload.body,
        html: payload.html,
        from: "transactional",
      });
      await logTransactionalEmail(payload, result);
    } catch {
      /* ignore */
    }
  })();
}

/** Fire-and-forget — never throws to callers. */
export function sendWelcomeOwnerEmail(input: { name: string; email: string }) {
  queueTransactionalEmail(async () => {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/dashboard`;
    const subject = "Welcome to CartFlow";
    const { html, text } = await renderEmailTemplate(
      WelcomeEmail({
        name: input.name,
        dashboardUrl,
        appUrl,
      }),
    );
    return { recipient: input.email, subject, body: text, html };
  });
}

export function sendStoreApprovedEmail(input: {
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  storeSlug: string;
  businessId: string;
}) {
  queueTransactionalEmail(async () => {
    const appUrl = getAppUrl();
    const productsUrl = `${appUrl}/dashboard/products`;
    const storefrontUrl = `${appUrl}/${input.storeSlug}`;
    const subject = `${input.storeName} has been approved`;
    const { html, text } = await renderEmailTemplate(
      StoreApprovedEmail({
        ownerName: input.ownerName,
        storeName: input.storeName,
        productsUrl,
        storefrontUrl,
        appUrl,
      }),
    );
    return {
      recipient: input.ownerEmail,
      subject,
      body: text,
      html,
      businessId: input.businessId,
    };
  });
}

export function sendStoreRejectedEmail(input: {
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  businessId: string;
  reason: string;
  canResubmit: boolean;
}) {
  queueTransactionalEmail(async () => {
    const appUrl = getAppUrl();
    const settingsUrl = `${appUrl}/dashboard/settings`;
    const subject = `${input.storeName} — application update required`;
    const { html, text } = await renderEmailTemplate(
      StoreRejectedEmail({
        ownerName: input.ownerName,
        storeName: input.storeName,
        reason: input.reason,
        canResubmit: input.canResubmit,
        settingsUrl,
        appUrl,
      }),
    );
    return {
      recipient: input.ownerEmail,
      subject,
      body: text,
      html,
      businessId: input.businessId,
    };
  });
}

export function sendTeamInviteEmail(input: {
  businessId: string;
  recipientEmail: string;
  recipientName?: string | null;
  storeName: string;
  invitedByName: string;
  accessPreset: string;
  inviteUrl: string;
}) {
  queueTransactionalEmail(async () => {
    const appUrl = getAppUrl();
    const roleLabel = presetLabel(input.accessPreset);
    const subject = `Invitation to join ${input.storeName} on CartFlow`;
    const { html, text } = await renderEmailTemplate(
      TeamInviteEmail({
        recipientName: input.recipientName,
        storeName: input.storeName,
        invitedByName: input.invitedByName,
        roleLabel,
        inviteUrl: input.inviteUrl,
        expiresInDays: INVITE_TTL_DAYS,
        appUrl,
      }),
    );
    return {
      recipient: input.recipientEmail,
      subject,
      body: text,
      html,
      businessId: input.businessId,
    };
  });
}
