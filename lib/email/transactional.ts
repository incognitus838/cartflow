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
    const onboardingUrl = `${appUrl}/onboarding`;
    const subject = "Welcome to CartFlow";
    const text = [
      `Hi ${input.name},`,
      "",
      "Thanks for signing up for CartFlow.",
      "",
      "Next step: create your store — add your business name, bank details, and contact info so we can review your application.",
      "",
      `Start setup: ${onboardingUrl}`,
    ].join("\n");

    const html = renderEmailLayout({
      preview: "Create your store on CartFlow",
      title: "Welcome to CartFlow",
      bodyHtml: [
        paragraph(`Hi ${input.name},`),
        paragraph("Thanks for signing up. You're one step away from selling with manual bank-transfer checkout built for African sellers."),
        paragraph("Create your store application next — we'll need your business details and bank info for admin review."),
        bulletList([
          "Set up your store name and URL",
          "Add bank details for payouts",
          "Configure catalog categories while you wait",
        ]),
      ].join(""),
      cta: { label: "Create your store", href: onboardingUrl },
      footerNote: "Product uploads and your public storefront unlock after platform approval.",
    });

    return { recipient: input.email, subject, body: text, html };
  });
}

export function sendStoreSubmittedEmail(input: {
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  storeSlug: string;
  businessId: string;
}) {
  queueTransactionalEmail(() => {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/dashboard`;
    const subject = `${input.storeName} submitted for review`;
    const text = [
      `Hi ${input.ownerName},`,
      "",
      `Your store "${input.storeName}" has been submitted for CartFlow approval.`,
      "",
      "While you wait (usually within 24 hours), update bank/contact info and set up catalog categories in your dashboard.",
      "",
      `Dashboard: ${dashboardUrl}`,
    ].join("\n");

    const html = renderEmailLayout({
      preview: `${input.storeName} is under review`,
      title: "Application submitted",
      bodyHtml: [
        paragraph(`Hi ${input.ownerName},`),
        paragraph(`Your store ${input.storeName} (/${input.storeSlug}) is now in the admin review queue.`),
        paragraph("Finish your setup checklist while you wait — this helps us approve you faster."),
        bulletList([
          "Bank details and contact info in Settings",
          "Catalog categories and tags",
          "Platform review (usually within 24 hours)",
        ]),
        paragraph("Products, orders, and your public store link unlock after approval."),
      ].join(""),
      cta: { label: "Open dashboard", href: dashboardUrl },
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

export function sendStoreApprovedEmail(input: {
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  storeSlug: string;
  businessId: string;
}) {
  queueTransactionalEmail(() => {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/dashboard/products`;
    const storefrontUrl = `${appUrl}/${input.storeSlug}`;
    const subject = `${input.storeName} is approved — you're live!`;
    const text = [
      `Hi ${input.ownerName},`,
      "",
      `Great news — ${input.storeName} has been approved on CartFlow.`,
      "",
      `Add products: ${dashboardUrl}`,
      `Storefront: ${storefrontUrl}`,
    ].join("\n");

    const html = renderEmailLayout({
      preview: "Your store is live on CartFlow",
      title: "You're approved!",
      bodyHtml: [
        paragraph(`Hi ${input.ownerName},`),
        paragraph(`${input.storeName} is now live on CartFlow.`),
        paragraph("Add your first products, customize your storefront, and share your link with customers."),
      ].join(""),
      cta: { label: "Add products", href: dashboardUrl },
      footerNote: `Your storefront: ${storefrontUrl}`,
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
    const subject = `Update needed for ${input.storeName}`;
    const text = [
      `Hi ${input.ownerName},`,
      "",
      `Your store application for ${input.storeName} was not approved.`,
      "",
      `Reason: ${input.reason}`,
      "",
      input.canResubmit ? `Update details: ${settingsUrl}` : "Contact support if this was a mistake.",
    ].join("\n");

    const html = renderEmailLayout({
      preview: "Your store application needs updates",
      title: "Application not approved",
      bodyHtml: [
        paragraph(`Hi ${input.ownerName},`),
        paragraph(`We couldn't approve ${input.storeName} yet.`),
        paragraph(`Reason: ${input.reason}`),
        input.canResubmit
          ? paragraph("Update your store details in Settings, then contact support to resubmit if needed.")
          : paragraph("Contact support if you believe this was a mistake."),
      ].join(""),
      cta: input.canResubmit ? { label: "Update store details", href: settingsUrl } : undefined,
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
    const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
    const subject = `You're invited to ${input.storeName} on CartFlow`;
    const text = [
      greeting,
      "",
      `${input.invitedByName} invited you to help manage ${input.storeName} on CartFlow.`,
      `Access level: ${roleLabel}`,
      "",
      `Accept your invite: ${input.inviteUrl}`,
      "",
      `This link expires in ${INVITE_TTL_DAYS} days.`,
    ].join("\n");

    const html = renderEmailLayout({
      preview: `Join ${input.storeName} on CartFlow`,
      title: `Join ${input.storeName}`,
      bodyHtml: [
        paragraph(greeting.replace(/,$/, "")),
        paragraph(`${input.invitedByName} invited you to the ${input.storeName} seller dashboard on CartFlow.`),
        paragraph(`Your access level: ${roleLabel}`),
        paragraph("Create your account or sign in with this email to accept."),
      ].join(""),
      cta: { label: "Accept invite", href: input.inviteUrl },
      footerNote: `This invite expires in ${INVITE_TTL_DAYS} days.`,
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