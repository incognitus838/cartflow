import type { OrderPaymentEventAction } from "@prisma/client";

export const PAYMENT_EVENT_LABELS: Record<OrderPaymentEventAction, string> = {
  RECEIPT_SUBMITTED: "Receipt submitted",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_REJECTED: "Payment rejected",
};