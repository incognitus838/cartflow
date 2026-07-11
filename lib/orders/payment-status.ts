import type { OrderPaymentEventAction, OrderStatus } from "@prisma/client";

export type PaymentReviewStatus =
  | "awaiting_receipt"
  | "needs_review"
  | "approved"
  | "declined"
  | "refunded";

export const PAYMENT_REVIEW_LABELS: Record<PaymentReviewStatus, string> = {
  awaiting_receipt: "Awaiting receipt",
  needs_review: "Needs review",
  approved: "Approved",
  declined: "Declined",
  refunded: "Refunded",
};

export const PAYMENT_REVIEW_BADGE: Record<PaymentReviewStatus, string> = {
  awaiting_receipt: "cf-badge cf-badge-pending",
  needs_review: "cf-badge cf-badge-pending",
  approved: "cf-badge cf-badge-paid",
  declined: "cf-badge cf-badge-cancelled",
  refunded: "cf-badge cf-badge-refunded",
};

type PaymentStatusInput = {
  status: OrderStatus;
  hasPaymentReceipt: boolean;
  paymentRejectionReason?: string | null;
  paymentEvents?: Array<{ action: OrderPaymentEventAction }>;
};

export function getPaymentReviewStatus(order: PaymentStatusInput): PaymentReviewStatus {
  if (order.status === "REFUNDED") return "refunded";

  const hasApproved = order.paymentEvents?.some((e) => e.action === "PAYMENT_APPROVED");
  const hasRejected = order.paymentEvents?.some((e) => e.action === "PAYMENT_REJECTED");

  if (order.status !== "PENDING") {
    return hasApproved || ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
      ? "approved"
      : "awaiting_receipt";
  }

  if (order.hasPaymentReceipt) return "needs_review";
  if (order.paymentRejectionReason || hasRejected) return "declined";
  return "awaiting_receipt";
}