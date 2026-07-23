import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import { getAppUrl } from "@/lib/email/config";
import { bulletList, paragraph, renderEmailLayout } from "@/lib/email/templates/layout";
import { sendNotification, isSmsConfigured } from "@/lib/notifications/send";
import { trackOrderLookupPath } from "@/lib/storefront/paths";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

function statusLabel(status: OrderStatus) {
  const labels: Partial<Record<OrderStatus, string>> = {
    PENDING: "pending payment confirmation",
    PAID: "paid and confirmed",
    PROCESSING: "being prepared",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
  };
  return labels[status] ?? status.toLowerCase().replace(/_/g, " ");
}

function orderTrackUrl(storeSlug: string, orderNumber: string) {
  return `${getAppUrl()}${trackOrderLookupPath(storeSlug, orderNumber)}`;
}

function dashboardOrdersUrl() {
  return `${getAppUrl()}/dashboard/orders`;
}

export async function notifyNewOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      business: { include: { owner: true } },
      items: true,
    },
  });

  if (!order || !order.business.notifyOnNewOrder) return;

  const ownerEmail = order.business.ownerNotifyEmail || order.business.owner.email;
  const total = formatCurrency(toNumber(order.total), order.business.currency);
  const ordersUrl = dashboardOrdersUrl();
  const itemList = order.items.map(
    (item) =>
      `${item.title}${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity}`,
  );

  const text = [
    `Dear ${order.business.owner.name},`,
    "",
    `A new order has been placed at ${order.business.name}.`,
    "",
    `Order number: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Total: ${total}`,
    "",
    "Items:",
    ...itemList.map((line) => `• ${line}`),
    order.notes ? `\nCustomer note: ${order.notes}` : "",
    "",
    "Please review the payment receipt and confirm the order in your dashboard.",
    "",
    `Orders: ${ordersUrl}`,
    "",
    "Kind regards,",
    "CartFlow",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderEmailLayout({
    preview: `New order ${order.orderNumber} — ${total}`,
    title: "New order received",
    bodyHtml: [
      paragraph(`Dear ${order.business.owner.name},`),
      paragraph(`A new order has been placed at ${order.business.name}.`),
      paragraph(`Order number: ${order.orderNumber}`),
      paragraph(`Customer: ${order.customerName} · ${order.customerPhone}`),
      paragraph(`Total: ${total}`),
      paragraph("Items:"),
      bulletList(itemList),
      order.notes ? paragraph(`Customer note: ${order.notes}`) : "",
      paragraph(
        "Please review the payment receipt and confirm the order in your dashboard.",
      ),
    ].join(""),
    cta: { label: "Review order", href: ordersUrl },
  });

  await sendNotification({
    businessId: order.businessId,
    orderId: order.id,
    channel: "EMAIL",
    recipient: ownerEmail,
    subject: `New order ${order.orderNumber} — ${total}`,
    body: text,
    html,
  });

  if (order.business.phone && isSmsConfigured()) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "SMS",
      recipient: order.business.phone,
      body: `CartFlow: New order ${order.orderNumber} (${total}). Please review in your dashboard.`,
    });
  }
}

export async function notifyOrderStatusChange(orderId: string, newStatus: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { business: true, customer: true },
  });

  if (!order || !order.business.notifyCustomerOnStatus) return;

  const customerEmail = order.customer?.email;
  const label = statusLabel(newStatus);
  const trackUrl = orderTrackUrl(order.business.slug, order.orderNumber);

  const text = [
    `Dear ${order.customerName},`,
    "",
    `This is an update regarding your order ${order.orderNumber} from ${order.business.name}.`,
    "",
    `Current status: ${label}.`,
    "",
    `You may view your order details at any time:`,
    trackUrl,
    "",
    "If you have questions, please contact the seller using the details on your order page.",
    "",
    "Kind regards,",
    order.business.name,
    "(via CartFlow)",
  ].join("\n");

  const html = renderEmailLayout({
    preview: `Order ${order.orderNumber} is ${label}`,
    title: "Order status update",
    bodyHtml: [
      paragraph(`Dear ${order.customerName},`),
      paragraph(
        `This is an update regarding your order ${order.orderNumber} from ${order.business.name}.`,
      ),
      paragraph(`Current status: ${label}.`),
      paragraph("You may view your order details at any time using the link below."),
    ].join(""),
    cta: { label: "View order", href: trackUrl },
    footerNote: "If you have questions, please contact the seller via your order page.",
  });

  if (customerEmail) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "EMAIL",
      recipient: customerEmail,
      subject: `Order ${order.orderNumber} — ${label}`,
      body: text,
      html,
    });
  }

  if (isSmsConfigured()) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "SMS",
      recipient: order.customerPhone,
      body: `CartFlow: Order ${order.orderNumber} from ${order.business.name} is now ${label}. ${trackUrl}`,
    });
  }
}

export async function notifyPaymentRejected(orderId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { business: true, customer: true },
  });

  if (!order || !order.business.notifyCustomerOnStatus) return;

  const customerEmail = order.customer?.email;
  const trackUrl = orderTrackUrl(order.business.slug, order.orderNumber);

  const text = [
    `Dear ${order.customerName},`,
    "",
    `We regret to inform you that the payment submitted for order ${order.orderNumber} from ${order.business.name} could not be approved.`,
    "",
    `Reason: ${reason}`,
    "",
    "Please upload a new payment receipt using your order page, or contact the seller for assistance.",
    "",
    trackUrl,
    "",
    "Kind regards,",
    order.business.name,
    "(via CartFlow)",
  ].join("\n");

  const html = renderEmailLayout({
    preview: `Payment not approved for ${order.orderNumber}`,
    title: "Payment not approved",
    bodyHtml: [
      paragraph(`Dear ${order.customerName},`),
      paragraph(
        `We regret to inform you that the payment submitted for order ${order.orderNumber} from ${order.business.name} could not be approved.`,
      ),
      paragraph(`Reason: ${reason}`),
      paragraph(
        "Please upload a new payment receipt using your order page, or contact the seller for assistance.",
      ),
    ].join(""),
    cta: { label: "Upload new receipt", href: trackUrl },
  });

  if (customerEmail) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "EMAIL",
      recipient: customerEmail,
      subject: `Payment not approved — ${order.orderNumber}`,
      body: text,
      html,
    });
  }

  if (isSmsConfigured()) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "SMS",
      recipient: order.customerPhone,
      body: `CartFlow: Payment for ${order.orderNumber} was not approved. Reason: ${reason}. ${trackUrl}`,
    });
  }
}
