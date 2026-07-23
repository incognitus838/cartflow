import "server-only";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { getAppUrl } from "@/lib/email/config";
import { bulletList, paragraph, renderEmailLayout } from "@/lib/email/templates/layout";
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

function queueTransactionalEmail(build: () => EmailPayload) {
  void (async () => {
    try {
      const payload = build();
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
  queueTransactionalEmail(() => {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/dashboard`;
    const subject = "Welcome to CartFlow";
    const text = [
      `Dear ${input.name},`,
      "",
      "Thank you for creating an account with CartFlow.",
      "",
      "Your store application has been received and is awaiting platform review. During this period, you may sign in to your dashboard to prepare catalog categories and store settings.",
      "",
      "Product uploads and your public storefront will become available once your store is approved.",
      "",
      `Dashboard: ${dashboardUrl}`,
      "",
      "Kind regards,",
      "The CartFlow Team",
    ].join("\n");

    const html = renderEmailLayout({
      preview: "Your CartFlow account has been created",
      title: "Welcome to CartFlow",
      bodyHtml: [
        paragraph(`Dear ${input.name},`),
        paragraph("Thank you for creating an account with CartFlow."),
        paragraph(
          "Your store application has been received and is awaiting platform review. During this period, you may sign in to prepare your catalog structure and store settings.",
        ),
        bulletList([
          "Complete bank and contact details in Settings",
          "Organise catalog categories and product types",
          "Add products and share your store link after approval",
        ]),
        paragraph(
          "Product uploads and your public storefront will become available once your store is approved.",
        ),
      ].join(""),
      cta: { label: "Open dashboard", href: dashboardUrl },
      footerNote: "If you did not create this account, please disregard this message.",
    });

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
  queueTransactionalEmail(() => {
    const appUrl = getAppUrl();
    const productsUrl = `${appUrl}/dashboard/products`;
    const storefrontUrl = `${appUrl}/${input.storeSlug}`;
    const subject = `${input.storeName} has been approved`;
    const text = [
      `Dear ${input.ownerName},`,
      "",
      `We are pleased to inform you that ${input.storeName} has been approved and is now live on CartFlow.`,
      "",
      "You may now add products, customise your storefront, and share your store link with customers.",
      "",
      `Add products: ${productsUrl}`,
      `Storefront: ${storefrontUrl}`,
      "",
      "Kind regards,",
      "The CartFlow Team",
    ].join("\n");

    const html = renderEmailLayout({
      preview: `${input.storeName} is approved and live`,
      title: "Your store has been approved",
      bodyHtml: [
        paragraph(`Dear ${input.ownerName},`),
        paragraph(
          `We are pleased to inform you that ${input.storeName} has been approved and is now live on CartFlow.`,
        ),
        paragraph(
          "You may now add products, customise your storefront presentation, and share your store link with customers via WhatsApp or social channels.",
        ),
        bulletList([
          "Add products with clear pricing and stock",
          "Confirm bank details for customer transfers",
          "Share your storefront link with buyers",
        ]),
      ].join(""),
      cta: { label: "Add products", href: productsUrl },
      footerNote: `Your public storefront: ${storefrontUrl}`,
    });

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
  queueTransactionalEmail(() => {
    const appUrl = getAppUrl();
    const settingsUrl = `${appUrl}/dashboard/settings`;
    const subject = `${input.storeName} — application update required`;
    const nextStep = input.canResubmit
      ? `Please review the reason below, update your store details in Settings, and contact support if you wish to resubmit.`
      : `Please contact support if you believe this decision was made in error.`;
    const text = [
      `Dear ${input.ownerName},`,
      "",
      `Following review, we are unable to approve the application for ${input.storeName} at this time.`,
      "",
      `Reason: ${input.reason}`,
      "",
      nextStep,
      "",
      input.canResubmit ? `Settings: ${settingsUrl}` : "",
      "",
      "Kind regards,",
      "The CartFlow Team",
    ]
      .filter(Boolean)
      .join("\n");

    const html = renderEmailLayout({
      preview: `Update required for ${input.storeName}`,
      title: "Application update required",
      bodyHtml: [
        paragraph(`Dear ${input.ownerName},`),
        paragraph(
          `Following review, we are unable to approve the application for ${input.storeName} at this time.`,
        ),
        paragraph(`Reason: ${input.reason}`),
        paragraph(nextStep),
      ].join(""),
      cta: input.canResubmit ? { label: "Update store details", href: settingsUrl } : undefined,
      footerNote: "This message relates to your CartFlow store application.",
    });

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
  queueTransactionalEmail(() => {
    const roleLabel = presetLabel(input.accessPreset);
    const greeting = input.recipientName ? `Dear ${input.recipientName},` : "Dear colleague,";
    const subject = `Invitation to join ${input.storeName} on CartFlow`;
    const text = [
      greeting,
      "",
      `${input.invitedByName} has invited you to join the seller dashboard for ${input.storeName} on CartFlow.`,
      "",
      `Access level: ${roleLabel}`,
      "",
      `Please accept this invitation using the link below. The link expires in ${INVITE_TTL_DAYS} days.`,
      "",
      input.inviteUrl,
      "",
      "Kind regards,",
      "The CartFlow Team",
    ].join("\n");

    const html = renderEmailLayout({
      preview: `Invitation to ${input.storeName}`,
      title: `Invitation to ${input.storeName}`,
      bodyHtml: [
        paragraph(greeting.replace(/,$/, "")),
        paragraph(
          `${input.invitedByName} has invited you to join the seller dashboard for ${input.storeName} on CartFlow.`,
        ),
        paragraph(`Access level: ${roleLabel}.`),
        paragraph(
          `Please accept this invitation using the button below. This link expires in ${INVITE_TTL_DAYS} days.`,
        ),
      ].join(""),
      cta: { label: "Accept invitation", href: input.inviteUrl },
      footerNote: "If you were not expecting this invitation, you may ignore this email.",
    });

    return {
      recipient: input.recipientEmail,
      subject,
      body: text,
      html,
      businessId: input.businessId,
    };
  });
}
