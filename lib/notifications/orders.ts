import { NewOrderEmail } from "@/emails/new-order";
import { OrderStatusEmail } from "@/emails/order-status";
import { PaymentRejectedEmail } from "@/emails/payment-rejected";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import { getAppUrl } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/render-template";
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
  const appUrl = getAppUrl();

  const { html, text } = await renderEmailTemplate(
    NewOrderEmail({
      ownerName: order.business.owner.name,
      storeName: order.business.name,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total,
      items: itemList,
      customerNote: order.notes,
      ordersUrl,
      appUrl,
    }),
  );

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
  const appUrl = getAppUrl();

  const { html, text } = await renderEmailTemplate(
    OrderStatusEmail({
      customerName: order.customerName,
      storeName: order.business.name,
      orderNumber: order.orderNumber,
      statusLabel: label,
      trackUrl,
      appUrl,
    }),
  );

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
  const appUrl = getAppUrl();

  const { html, text } = await renderEmailTemplate(
    PaymentRejectedEmail({
      customerName: order.customerName,
      storeName: order.business.name,
      orderNumber: order.orderNumber,
      reason,
      trackUrl,
      appUrl,
    }),
  );

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
