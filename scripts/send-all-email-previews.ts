/**
 * Render and send every CartFlow transactional email template.
 * Usage: npx dotenv-cli -e .env.local -- npx tsx scripts/send-all-email-previews.ts [to@email.com]
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { WelcomeEmail } from "../emails/welcome";
import { StoreApprovedEmail } from "../emails/store-approved";
import { StoreRejectedEmail } from "../emails/store-rejected";
import { TeamInviteEmail } from "../emails/team-invite";
import { NewOrderEmail } from "../emails/new-order";
import { OrderStatusEmail } from "../emails/order-status";
import { PaymentRejectedEmail } from "../emails/payment-rejected";

function loadEnv(path: string) {
  if (!existsSync(path)) return {} as Record<string, string>;
  const vars: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[trimmed.slice(0, eq).trim()] = value;
  }
  return vars;
}

const fileEnv = loadEnv(resolve(process.cwd(), ".env.local"));
const env = { ...fileEnv, ...process.env } as Record<string, string>;

const to =
  process.argv[2]?.trim() ||
  env.EMAIL_TEST_TO?.trim() ||
  "incognitus838@gmail.com";

const apiKey = env.RESEND_API_KEY?.trim();
const from =
  env.TRANSACTIONAL_FROM_EMAIL?.trim() || "CartFlow <hello@cartflow.com.ng>";
const appUrl = (env.NEXT_PUBLIC_APP_URL || "https://cartflow.com.ng").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

type Sample = {
  key: string;
  lane: "platform" | "commerce";
  subject: string;
  fromLane: "transactional" | "notification";
  element: ReactElement;
};

const samples: Sample[] = [
  {
    key: "1-welcome",
    lane: "platform",
    subject: "[Preview] Welcome to CartFlow",
    fromLane: "transactional",
    element: WelcomeEmail({
      name: "Ada Okonkwo",
      dashboardUrl: `${appUrl}/dashboard`,
      appUrl,
    }),
  },
  {
    key: "2-store-approved",
    lane: "platform",
    subject: "[Preview] Glow Beauty has been approved",
    fromLane: "transactional",
    element: StoreApprovedEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      productsUrl: `${appUrl}/dashboard/products`,
      storefrontUrl: `${appUrl}/glow-beauty`,
      appUrl,
    }),
  },
  {
    key: "3-store-rejected",
    lane: "platform",
    subject: "[Preview] Glow Beauty — application update required",
    fromLane: "transactional",
    element: StoreRejectedEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      reason: "Bank account details are incomplete. Please add a valid account number.",
      canResubmit: true,
      settingsUrl: `${appUrl}/dashboard/settings`,
      appUrl,
    }),
  },
  {
    key: "4-team-invite",
    lane: "platform",
    subject: "[Preview] Invitation to join Glow Beauty on CartFlow",
    fromLane: "transactional",
    element: TeamInviteEmail({
      recipientName: "Tunde Adebayo",
      storeName: "Glow Beauty",
      invitedByName: "Ada Okonkwo",
      roleLabel: "Staff",
      inviteUrl: `${appUrl}/invite/demo-token`,
      expiresInDays: 7,
      appUrl,
    }),
  },
  {
    key: "5-new-order",
    lane: "commerce",
    subject: "[Preview] New order CF-PREVIEW-001 — ₦18,500",
    fromLane: "notification",
    element: NewOrderEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      orderNumber: "CF-PREVIEW-001",
      customerName: "Chioma Nwosu",
      customerPhone: "+2348012345678",
      total: "₦18,500",
      items: ["Oud Lagos Serum × 1", "Velvet Kiss Lip Oil × 2"],
      customerNote: "Please deliver after 5pm.",
      ordersUrl: `${appUrl}/dashboard/orders`,
      appUrl,
    }),
  },
  {
    key: "6-order-status",
    lane: "commerce",
    subject: "[Preview] Order CF-PREVIEW-001 — paid and confirmed",
    fromLane: "notification",
    element: OrderStatusEmail({
      customerName: "Chioma Nwosu",
      storeName: "Glow Beauty",
      orderNumber: "CF-PREVIEW-001",
      statusLabel: "paid and confirmed",
      trackUrl: `${appUrl}/glow-beauty/track?order=CF-PREVIEW-001`,
      appUrl,
    }),
  },
  {
    key: "7-payment-rejected",
    lane: "commerce",
    subject: "[Preview] Payment not approved — CF-PREVIEW-001",
    fromLane: "notification",
    element: PaymentRejectedEmail({
      customerName: "Chioma Nwosu",
      storeName: "Glow Beauty",
      orderNumber: "CF-PREVIEW-001",
      reason: "The transfer amount does not match the order total.",
      trackUrl: `${appUrl}/glow-beauty/track?order=CF-PREVIEW-001`,
      appUrl,
    }),
  },
];

const notificationFrom =
  env.NOTIFICATION_FROM_EMAIL?.trim() || "CartFlow Orders <orders@cartflow.com.ng>";

async function main() {
  console.log(`Sending ${samples.length} preview emails to ${to}\n`);

  let ok = 0;
  let fail = 0;

  for (const sample of samples) {
    const html = await render(sample.element);
    const text = await render(sample.element, { plainText: true });
    const fromAddress =
      sample.fromLane === "notification" ? notificationFrom : from;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: sample.subject,
        html,
        text,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!res.ok) {
      fail += 1;
      console.log(`✗ ${sample.key} (${sample.lane}): ${data.message || res.status}`);
    } else {
      ok += 1;
      console.log(`✓ ${sample.key} (${sample.lane}): ${data.id}`);
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\nDone. Sent ${ok}/${samples.length}${fail ? `, failed ${fail}` : ""}.`);
  console.log("Expect 7 emails in your inbox (subjects start with [Preview]).");
  if (fail) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
