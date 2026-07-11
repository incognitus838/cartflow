import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deductStockForOrder, restoreStockForOrder } from "@/lib/inventory";
import { notifyOrderStatusChange } from "@/lib/notifications/orders";
import { scopedOrderWhere } from "@/lib/tenant";

const FULFILLED_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const LOCKED_ITEM_STATUSES: OrderStatus[] = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export type OrderItemUpdate = {
  id: string;
  quantity?: number;
  remove?: boolean;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  internalNotes?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryFee?: number;
  items?: OrderItemUpdate[];
};

export function parseOrderUpdate(body: unknown): UpdateOrderInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const status = typeof data.status === "string" ? data.status : undefined;
  const internalNotes =
    typeof data.internalNotes === "string" ? data.internalNotes.trim() : undefined;
  const customerName =
    typeof data.customerName === "string" ? data.customerName.trim() : undefined;
  const customerPhone =
    typeof data.customerPhone === "string" ? data.customerPhone.trim() : undefined;
  const customerAddress =
    typeof data.customerAddress === "string" ? data.customerAddress.trim() : undefined;
  const deliveryFee =
    data.deliveryFee === undefined || data.deliveryFee === null
      ? undefined
      : Number(data.deliveryFee);

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

  if (customerName !== undefined && customerName.length < 2) {
    return "Customer name must be at least 2 characters.";
  }

  if (customerPhone !== undefined && customerPhone.length < 7) {
    return "A valid customer phone number is required.";
  }

  if (deliveryFee !== undefined && (!Number.isFinite(deliveryFee) || deliveryFee < 0)) {
    return "Delivery fee must be zero or greater.";
  }

  let items: OrderItemUpdate[] | undefined;
  if (Array.isArray(data.items)) {
    const parsedItems: OrderItemUpdate[] = [];

    for (const row of data.items) {
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      const id = typeof item.id === "string" ? item.id : "";
      if (!id) continue;
      const quantity = item.quantity === undefined ? undefined : Number(item.quantity);
      const remove = item.remove === true;
      if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1)) {
        return "Item quantity must be at least 1.";
      }
      parsedItems.push({ id, quantity, remove });
    }

    items = parsedItems.length > 0 ? parsedItems : undefined;
  }

  return {
    status: status as OrderStatus | undefined,
    internalNotes,
    customerName,
    customerPhone,
    customerAddress,
    deliveryFee,
    items,
  };
}

function recalculateTotals(
  items: Array<{ total: { toString(): string } | number }>,
  discountAmount: number,
  deliveryFee: number,
) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  return { subtotal, total };
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

  if (input.items?.length && LOCKED_ITEM_STATUSES.includes(existing.status)) {
    throw new Error("Items cannot be changed after an order has shipped or been closed.");
  }

  const wasFulfilled = FULFILLED_STATUSES.includes(existing.status);
  const willBeFulfilled = input.status ? FULFILLED_STATUSES.includes(input.status) : wasFulfilled;

  const order = await prisma.$transaction(async (tx) => {
    if (input.items?.length) {
      const remainingIds = new Set(existing.items.map((item) => item.id));

      for (const patch of input.items) {
        if (!remainingIds.has(patch.id)) {
          throw new Error("One or more order items were not found.");
        }

        if (patch.remove) {
          await tx.orderItem.delete({ where: { id: patch.id } });
          remainingIds.delete(patch.id);
          continue;
        }

        if (patch.quantity !== undefined) {
          const line = existing.items.find((item) => item.id === patch.id);
          if (!line) continue;
          const unitPrice = Number(line.unitPrice);
          await tx.orderItem.update({
            where: { id: patch.id },
            data: {
              quantity: patch.quantity,
              total: unitPrice * patch.quantity,
            },
          });
        }
      }

      const count = await tx.orderItem.count({ where: { orderId } });
      if (count === 0) {
        throw new Error("An order must have at least one item.");
      }
    }

    const items = await tx.orderItem.findMany({ where: { orderId } });
    const discountAmount = Number(existing.discountAmount);
    const deliveryFee = input.deliveryFee ?? Number(existing.deliveryFee);
    const { subtotal, total } = recalculateTotals(items, discountAmount, deliveryFee);

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        internalNotes: input.internalNotes,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        deliveryFee,
        subtotal,
        total,
      },
      include: { items: true, customer: true },
    });

    if (
      (input.customerName || input.customerPhone || input.customerAddress) &&
      existing.customerId
    ) {
      await tx.customer.update({
        where: { id: existing.customerId },
        data: {
          name: input.customerName ?? existing.customerName,
          phone: input.customerPhone ?? existing.customerPhone,
          address: input.customerAddress ?? existing.customerAddress ?? undefined,
        },
      });
    }

    return updated;
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

  if (
    input.status === "REFUNDED" &&
    existing.status !== "REFUNDED" &&
    FULFILLED_STATUSES.includes(existing.status) &&
    existing.business.autoDeductInventory
  ) {
    await restoreStockForOrder(businessId, order.id, true);
  }

  if (input.status && input.status !== existing.status) {
    await notifyOrderStatusChange(order.id, input.status);
  }

  return order;
}