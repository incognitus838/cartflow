import { render } from "@react-email/render";
import { WelcomeEmail } from "../emails/welcome";
import { StoreApprovedEmail } from "../emails/store-approved";
import { NewOrderEmail } from "../emails/new-order";
import { OrderStatusEmail } from "../emails/order-status";
import { PaymentRejectedEmail } from "../emails/payment-rejected";
import { StoreRejectedEmail } from "../emails/store-rejected";
import { TeamInviteEmail } from "../emails/team-invite";

const appUrl = "https://cartflow.com.ng";

async function check(name: string, element: React.ReactElement) {
  const html = await render(element);
  const text = await render(element, { plainText: true });
  if (!html.includes("CartFlow")) throw new Error(`${name}: missing brand`);
  console.log(`✓ ${name}: html=${html.length}b text=${text.length}b`);
}

async function main() {
  await check(
    "welcome",
    WelcomeEmail({ name: "Ada Okonkwo", dashboardUrl: `${appUrl}/dashboard`, appUrl }),
  );
  await check(
    "store-approved",
    StoreApprovedEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      productsUrl: `${appUrl}/dashboard/products`,
      storefrontUrl: `${appUrl}/glow-beauty`,
      appUrl,
    }),
  );
  await check(
    "store-rejected",
    StoreRejectedEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      reason: "Incomplete bank details",
      canResubmit: true,
      settingsUrl: `${appUrl}/dashboard/settings`,
      appUrl,
    }),
  );
  await check(
    "team-invite",
    TeamInviteEmail({
      recipientName: "Tunde",
      storeName: "Glow Beauty",
      invitedByName: "Ada Okonkwo",
      roleLabel: "Staff",
      inviteUrl: `${appUrl}/invite/demo`,
      expiresInDays: 7,
      appUrl,
    }),
  );
  await check(
    "new-order",
    NewOrderEmail({
      ownerName: "Ada Okonkwo",
      storeName: "Glow Beauty",
      orderNumber: "CF-TEST-001",
      customerName: "Chioma Nwosu",
      customerPhone: "+2348012345678",
      total: "₦12,500",
      items: ["Serum × 1", "Lip Oil × 2"],
      customerNote: null,
      ordersUrl: `${appUrl}/dashboard/orders`,
      appUrl,
    }),
  );
  await check(
    "order-status",
    OrderStatusEmail({
      customerName: "Chioma Nwosu",
      storeName: "Glow Beauty",
      orderNumber: "CF-TEST-001",
      statusLabel: "paid and confirmed",
      trackUrl: `${appUrl}/glow-beauty/track?order=CF-TEST-001`,
      appUrl,
    }),
  );
  await check(
    "payment-rejected",
    PaymentRejectedEmail({
      customerName: "Chioma Nwosu",
      storeName: "Glow Beauty",
      orderNumber: "CF-TEST-001",
      reason: "Amount does not match order total",
      trackUrl: `${appUrl}/glow-beauty/track?order=CF-TEST-001`,
      appUrl,
    }),
  );

  console.log("All React Email templates render OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
