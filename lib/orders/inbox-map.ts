import type { OrderStatus } from "@prisma/client";
import type { OrderInboxData } from "@/lib/orders/inbox-types";
import { toNumber } from "@/lib/decimal";

export function mapOrderToInbox(
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    customerName: string;
    customerPhone: string;
    customerAddress: string | null;
    notes: string | null;
    promotionCode: string | null;
    discountAmount: { toString(): string } | number;
    subtotal: { toString(): string } | number;
    deliveryFee: { toString(): string } | number;
    deliveryZoneName?: string | null;
    total: { toString(): string } | number;
    createdAt: Date | string;
    paymentRejectionReason?: string | null;
    items: Array<{
      title: string;
      variantName: string | null;
      quantity: number;
      total: { toString(): string } | number;
    }>;
    customer?: { email: string | null } | null;
  },
  hasPaymentReceipt: boolean,
): OrderInboxData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customer?.email ?? null,
    customerAddress: order.customerAddress,
    notes: order.notes,
    promotionCode: order.promotionCode,
    discountAmount: toNumber(order.discountAmount),
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    deliveryZoneName: order.deliveryZoneName ?? null,
    total: toNumber(order.total),
    hasPaymentReceipt,
    paymentRejectionReason: order.paymentRejectionReason ?? null,
    createdAt:
      typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      title: item.title,
      variantName: item.variantName,
      quantity: item.quantity,
      total: toNumber(item.total),
    })),
  };
}