import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";

export type TrackingStepState = "complete" | "current" | "upcoming" | "cancelled";

export type TrackingStep = {
  key: string;
  label: string;
  description: string;
  state: TrackingStepState;
};

const FULFILLMENT_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -2,
};

function rank(status: OrderStatus): number {
  return FULFILLMENT_RANK[status];
}

type OrderTrackingInput = Pick<
  Order,
  "status" | "paymentReceiptSubmittedAt" | "createdAt" | "updatedAt"
> & {
  paymentReceiptData?: Uint8Array | Buffer | null;
  paymentReceiptMimeType?: string | null;
};

export function getOrderTrackingSteps(order: OrderTrackingInput): TrackingStep[] {
  const hasReceipt = orderHasReceipt(order);
  const receiptAt = order.paymentReceiptSubmittedAt;
  const status = order.status;

  if (status === "CANCELLED") {
    return [
      {
        key: "placed",
        label: "Order placed",
        description: order.createdAt.toLocaleString(),
        state: "complete",
      },
      {
        key: "cancelled",
        label: "Order cancelled",
        description: "This order was cancelled.",
        state: "cancelled",
      },
    ];
  }

  if (status === "REFUNDED") {
    return [
      {
        key: "placed",
        label: "Order placed",
        description: order.createdAt.toLocaleString(),
        state: "complete",
      },
      {
        key: "refunded",
        label: "Refunded",
        description: "Payment has been refunded.",
        state: "cancelled",
      },
    ];
  }

  const placed: TrackingStep = {
    key: "placed",
    label: "Order placed",
    description: order.createdAt.toLocaleString(),
    state: "complete",
  };

  const receiptStep: TrackingStep = {
    key: "receipt",
    label: "Receipt submitted",
    description: hasReceipt
      ? receiptAt?.toLocaleString() ?? "Submitted with your order"
      : "Upload your payment receipt to continue",
    state: hasReceipt ? "complete" : status === "PENDING" ? "current" : "upcoming",
  };

  const paid: TrackingStep = {
    key: "paid",
    label: "Payment confirmed",
    description:
      rank(status) >= rank("PAID")
        ? "Seller verified your payment"
        : hasReceipt
          ? "Seller is verifying your receipt"
          : "Awaiting receipt and seller approval",
    state:
      rank(status) >= rank("PAID")
        ? "complete"
        : hasReceipt && status === "PENDING"
          ? "current"
          : "upcoming",
  };

  const processing: TrackingStep = {
    key: "processing",
    label: "Preparing your order",
    description: "Your items are being packed",
    state:
      status === "PROCESSING"
        ? "current"
        : rank(status) > rank("PROCESSING")
          ? "complete"
          : "upcoming",
  };

  const shipped: TrackingStep = {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way",
    state:
      status === "SHIPPED" ? "current" : status === "DELIVERED" ? "complete" : "upcoming",
  };

  const delivered: TrackingStep = {
    key: "delivered",
    label: "Delivered",
    description:
      status === "DELIVERED"
        ? order.updatedAt.toLocaleString()
        : "We'll update you when it arrives",
    state: status === "DELIVERED" ? "complete" : "upcoming",
  };

  return [placed, receiptStep, paid, processing, shipped, delivered];
}

export function getTrackingHeadline(status: OrderStatus, hasReceipt: boolean): string {
  switch (status) {
    case "PENDING":
      return hasReceipt ? "Awaiting payment confirmation" : "Complete your payment";
    case "PAID":
      return "Payment confirmed";
    case "PROCESSING":
      return "Preparing your order";
    case "SHIPPED":
      return "On the way";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Order cancelled";
    case "REFUNDED":
      return "Refunded";
    default:
      return "Order status";
  }
}

export type PublicOrderItem = {
  title: string;
  variantName: string | null;
  quantity: number;
};

export type PublicOrderSnapshot = {
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  hasReceipt: boolean;
  receiptSubmittedAt: string | null;
  items: PublicOrderItem[];
};

export function toPublicOrderSnapshot(
  order: Order & { items: OrderItem[] },
): PublicOrderSnapshot {
  const hasReceipt = orderHasReceipt(order);

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    hasReceipt,
    receiptSubmittedAt: order.paymentReceiptSubmittedAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      title: item.title,
      variantName: item.variantName,
      quantity: item.quantity,
    })),
  };
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED";
}