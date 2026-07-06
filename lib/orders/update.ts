import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deductStockForOrder } from "@/lib/inventory";
import { notifyOrderStatusChange } from "@/lib/notifications/orders";
import { scopedOrderWhere } from "@/lib/tenant";

const FULFILLED_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

type UpdateOrderInput = {
  status?: OrderStatus;
  internalNotes?: string;
};

export function parseOrderUpdate(body: unknown): UpdateOrderInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const status = typeof data.status === "string" ? data.status : undefined;
  const internalNotes =
    typeof data.internalNotes === "string" ? data.internalNotes.trim() : undefined;

  const validStatuses: OrderStatus[] = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  if (status && !validStatuses.includes(status as OrderStatus)) {
    return "Invalid order status.";
  }

  return {
    status: status as OrderStatus | undefined,
    internalNotes,
  };
}

export async function updateBusinessOrder(
  businessId: string,
  orderId: string,
  input: UpdateOrderInput,
) {
  const existing = await prisma.order.findFirst({
    where: scopedOrderWhere(businessId, orderId),
    include: { items: true, business: { select: { autoDeductInventory: true } } },
  });

  if (!existing) throw new Error("Order not found");

  const wasFulfilled = FULFILLED_STATUSES.includes(existing.status);
  const willBeFulfilled = input.status ? FULFILLED_STATUSES.includes(input.status) : wasFulfilled;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: input.status,
      internalNotes: input.internalNotes,
    },
    include: { items: true, customer: true },
  });

  if (
    input.status &&
    !wasFulfilled &&
    willBeFulfilled &&
    existing.business.autoDeductInventory
  ) {
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

  if (input.status && input.status !== existing.status) {
    await notifyOrderStatusChange(order.id, input.status);
  }

  return order;
}