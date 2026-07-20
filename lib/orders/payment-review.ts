import { prisma } from "@/lib/db";
import { deductStockForOrder } from "@/lib/inventory";
import { notifyOrderStatusChange, notifyPaymentRejected } from "@/lib/notifications/orders";
import { clearReceiptFields, logOrderPaymentEvent } from "@/lib/orders/payment-events";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { logStoreActivity } from "@/lib/team/activity";
import { scopedOrderWhere } from "@/lib/tenant";

export type PaymentReviewInput = {
  action: "approve" | "reject";
  reason?: string;
  actorName?: string;
  actorUserId?: string;
  actorRole?: "owner" | "staff" | "admin";
};

export function parsePaymentReview(body: unknown): PaymentReviewInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const action = data.action;
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";
  const actorName = typeof data.actorName === "string" ? data.actorName.trim() : undefined;

  if (action !== "approve" && action !== "reject") {
    return 'Action must be "approve" or "reject".';
  }

  if (action === "reject" && reason.length < 3) {
    return "A rejection reason is required (at least 3 characters).";
  }

  return { action, reason: reason || undefined, actorName };
}

export async function reviewOrderPayment(
  businessId: string,
  orderId: string,
  input: PaymentReviewInput,
) {
  const existing = await prisma.order.findFirst({
    where: scopedOrderWhere(businessId, orderId),
    include: {
      items: true,
      business: { select: { autoDeductInventory: true } },
    },
  });

  if (!existing) throw new Error("Order not found");

  if (input.action === "approve") {
    if (existing.status !== "PENDING") {
      throw new Error("Only pending orders can be approved.");
    }
    if (!orderHasReceipt(existing)) {
      throw new Error("Upload a payment receipt before approving.");
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentRejectionReason: null,
        },
        include: { items: true, customer: true },
      });

      await logOrderPaymentEvent(
        orderId,
        "PAYMENT_APPROVED",
        { actorName: input.actorName },
        tx,
      );

      return updated;
    });

    if (existing.business.autoDeductInventory) {
      const stockItems = existing.items
        .filter((item) => item.productId)
        .map((item) => ({
          productId: item.productId!,
          variantId: item.variantId,
          quantity: item.quantity,
        }));

      if (stockItems.length > 0) {
        await deductStockForOrder(businessId, stockItems, order.id, true);
      }
    }

    await notifyOrderStatusChange(order.id, "PAID");
    await logStoreActivity({
      businessId,
      action: "PAYMENT_APPROVED",
      actorUserId: input.actorUserId,
      actorName: input.actorName,
      detail: `Payment approved for order ${existing.orderNumber}${
        input.actorRole === "staff" ? " · staff" : input.actorRole === "admin" ? " · platform admin" : ""
      }`,
      metadata: { orderId: existing.id, orderNumber: existing.orderNumber },
    });
    return order;
  }

  if (existing.status !== "PENDING") {
    throw new Error("Only pending orders can be rejected.");
  }
  if (!orderHasReceipt(existing)) {
    throw new Error("There is no payment receipt to reject.");
  }

  const reason = input.reason?.trim();
  if (!reason || reason.length < 3) {
    throw new Error("A rejection reason is required.");
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        ...clearReceiptFields(),
        paymentRejectionReason: reason,
      },
      include: { items: true, customer: true },
    });

    await logOrderPaymentEvent(
      orderId,
      "PAYMENT_REJECTED",
      { reason, actorName: input.actorName },
      tx,
    );

    return updated;
  });

  await notifyPaymentRejected(order.id, reason);
  await logStoreActivity({
    businessId,
    action: "PAYMENT_REJECTED",
    actorUserId: input.actorUserId,
    actorName: input.actorName,
    detail: `Payment rejected for order ${existing.orderNumber}${
      input.actorRole === "staff" ? " · staff" : input.actorRole === "admin" ? " · platform admin" : ""
    }`,
    metadata: { orderId: existing.id, orderNumber: existing.orderNumber, reason },
  });
  return order;
}