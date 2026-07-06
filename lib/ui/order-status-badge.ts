import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "cf-badge cf-badge-pending",
  PAID: "cf-badge cf-badge-paid",
  PROCESSING: "cf-badge cf-badge-processing",
  SHIPPED: "cf-badge cf-badge-shipped",
  DELIVERED: "cf-badge cf-badge-delivered",
  CANCELLED: "cf-badge cf-badge-cancelled",
  REFUNDED: "cf-badge cf-badge-refunded",
};