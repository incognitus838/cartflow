import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import { sendNotification } from "@/lib/notifications/send";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

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
  const itemList = order.items
    .map((item) => `• ${item.title}${item.variantName ? ` (${item.variantName})` : ""} ×${item.quantity}`)
    .join("\n");

  const body = [
    `New order ${order.orderNumber} at ${order.business.name}`,
    "",
    `Customer: ${order.customerName} (${order.customerPhone})`,
    `Total: ${total}`,
    "",
    itemList,
    order.notes ? `\nCustomer note: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await sendNotification({
    businessId: order.businessId,
    orderId: order.id,
    channel: "EMAIL",
    recipient: ownerEmail,
    subject: `New order ${order.orderNumber}`,
    body,
  });

  if (order.business.phone) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "SMS",
      recipient: order.business.phone,
      body: `CartFlow: New order ${order.orderNumber} — ${total}. Check your dashboard.`,
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
  const statusLabel = newStatus.toLowerCase().replace("_", " ");

  const body = `Hi ${order.customerName}, your order ${order.orderNumber} from ${order.business.name} is now ${statusLabel}.`;

  if (customerEmail) {
    await sendNotification({
      businessId: order.businessId,
      orderId: order.id,
      channel: "EMAIL",
      recipient: customerEmail,
      subject: `Order ${order.orderNumber} update`,
      body,
    });
  }

  await sendNotification({
    businessId: order.businessId,
    orderId: order.id,
    channel: "SMS",
    recipient: order.customerPhone,
    body,
  });
}