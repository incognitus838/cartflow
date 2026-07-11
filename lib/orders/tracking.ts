import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { toNumber, type NumericInput } from "@/lib/decimal";
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

export type OrderTrackingInput = Pick<
  Order,
  | "status"
  | "paymentReceiptSubmittedAt"
  | "createdAt"
  | "updatedAt"
  | "paymentRejectionReason"
> & {
  customerAddress?: string | null;
  deliveryFee?: NumericInput;
  paymentReceiptData?: Uint8Array | Buffer | null;
  paymentReceiptMimeType?: string | null;
};

export function orderNeedsDelivery(order: {
  customerAddress?: string | null;
  deliveryFee?: NumericInput;
}): boolean {
  const hasAddress = Boolean(order.customerAddress?.trim());
  const hasDeliveryFee = toNumber(order.deliveryFee) > 0;
  return hasAddress || hasDeliveryFee;
}

export function getDeliveryStatusLabel(
  status: OrderStatus,
  needsDelivery: boolean,
): string | null {
  if (!needsDelivery) return null;

  switch (status) {
    case "PENDING":
    case "PAID":
      return "Awaiting dispatch";
    case "PROCESSING":
      return "Preparing for delivery";
    case "SHIPPED":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Delivery cancelled";
    case "REFUNDED":
      return "Order refunded";
    default:
      return "Delivery pending";
  }
}

export function getPaymentStatusLabel(
  status: OrderStatus,
  hasReceipt: boolean,
  paymentRejectionReason?: string | null,
): string {
  if (status === "CANCELLED") return "Cancelled";
  if (status === "REFUNDED") return "Refunded";
  if (rank(status) >= rank("PAID")) return "Payment confirmed";
  if (paymentRejectionReason && !hasReceipt) return "Payment not approved";
  if (hasReceipt) return "Awaiting seller confirmation";
  return "Awaiting payment proof";
}

export function getOrderTrackingSteps(
  order: OrderTrackingInput,
  options?: { needsDelivery?: boolean },
): TrackingStep[] {
  const needsDelivery = options?.needsDelivery ?? orderNeedsDelivery(order);
  const hasReceipt = orderHasReceipt({
    paymentReceiptData: order.paymentReceiptData ?? null,
    paymentReceiptMimeType: order.paymentReceiptMimeType,
  });
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

  const wasRejected = Boolean(order.paymentRejectionReason) && status === "PENDING" && !hasReceipt;

  const receiptStep: TrackingStep = {
    key: "receipt",
    label: wasRejected ? "New receipt needed" : "Receipt submitted",
    description: hasReceipt
      ? receiptAt?.toLocaleString() ?? "Submitted with your order"
      : wasRejected
        ? order.paymentRejectionReason ?? "Upload a new payment receipt"
        : "Upload your payment receipt to continue",
    state: hasReceipt ? "complete" : status === "PENDING" ? "current" : "upcoming",
  };

  const paid: TrackingStep = {
    key: "paid",
    label: wasRejected ? "Payment not approved" : "Payment confirmed",
    description:
      rank(status) >= rank("PAID")
        ? "Seller verified your payment"
        : wasRejected
          ? order.paymentRejectionReason ?? "Seller rejected the previous receipt"
          : hasReceipt
            ? "Seller is verifying your receipt"
            : "Awaiting receipt and seller approval",
    state:
      rank(status) >= rank("PAID")
        ? "complete"
        : wasRejected
          ? "cancelled"
          : hasReceipt && status === "PENDING"
            ? "current"
            : "upcoming",
  };

  const processing: TrackingStep = {
    key: "processing",
    label: needsDelivery ? "Preparing your order" : "Processing your order",
    description: needsDelivery ? "Your items are being packed" : "Your order is being prepared",
    state:
      status === "PROCESSING"
        ? "current"
        : rank(status) > rank("PROCESSING")
          ? "complete"
          : "upcoming",
  };

  const steps: TrackingStep[] = [placed, receiptStep, paid, processing];

  if (needsDelivery) {
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

    steps.push(shipped, delivered);
  } else {
    const ready: TrackingStep = {
      key: "ready",
      label: "Ready",
      description:
        status === "DELIVERED"
          ? order.updatedAt.toLocaleString()
          : "We'll notify you when your order is ready",
      state:
        status === "DELIVERED" || status === "SHIPPED"
          ? "complete"
          : rank(status) >= rank("PROCESSING")
            ? "current"
            : "upcoming",
    };
    steps.push(ready);
  }

  return steps;
}

export function getTrackingHeadline(
  status: OrderStatus,
  hasReceipt: boolean,
  paymentRejectionReason?: string | null,
): string {
  switch (status) {
    case "PENDING":
      if (paymentRejectionReason && !hasReceipt) return "Payment not approved";
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

export type PublicOrderLineItem = {
  title: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PublicOrderTracking = {
  trackingId: string;
  orderNumber: string;
  status: OrderStatus;
  headline: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  deliveryZoneName: string | null;
  total: number;
  currency: string;
  storeName: string;
  storeSlug: string;
  customerName: string;
  customerAddress: string | null;
  needsDelivery: boolean;
  deliveryStatus: string | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  hasReceipt: boolean;
  receiptSubmittedAt: string | null;
  paymentRejectionReason: string | null;
  promotionCode: string | null;
  items: PublicOrderLineItem[];
};

export type PublicOrderSnapshot = PublicOrderTracking;

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `•••• ${digits.slice(-4)}`;
}

export function toPublicOrderTracking(
  order: Order & { items: OrderItem[] },
  store: { name: string; slug: string; currency: string },
): PublicOrderTracking {
  const hasReceipt = orderHasReceipt(order);
  const needsDelivery = orderNeedsDelivery(order);

  return {
    trackingId: order.orderNumber,
    orderNumber: order.orderNumber,
    status: order.status,
    headline: getTrackingHeadline(order.status, hasReceipt, order.paymentRejectionReason),
    subtotal: toNumber(order.subtotal),
    discountAmount: toNumber(order.discountAmount),
    deliveryFee: toNumber(order.deliveryFee),
    deliveryZoneName: order.deliveryZoneName ?? null,
    total: toNumber(order.total),
    currency: store.currency,
    storeName: store.name,
    storeSlug: store.slug,
    customerName: order.customerName,
    customerAddress: order.customerAddress,
    needsDelivery,
    deliveryStatus: getDeliveryStatusLabel(order.status, needsDelivery),
    paymentStatus: getPaymentStatusLabel(order.status, hasReceipt, order.paymentRejectionReason),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    hasReceipt,
    receiptSubmittedAt: order.paymentReceiptSubmittedAt?.toISOString() ?? null,
    paymentRejectionReason: order.paymentRejectionReason,
    promotionCode: order.promotionCode,
    items: order.items.map((item) => ({
      title: item.title,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineTotal: toNumber(item.total),
    })),
  };
}

export const toPublicOrderSnapshot = toPublicOrderTracking;

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED";
}

export { maskPhone };