import {
  getPaymentReviewStatus,
  PAYMENT_REVIEW_BADGE,
  PAYMENT_REVIEW_LABELS,
  type PaymentReviewStatus,
} from "@/lib/orders/payment-status";
import type { OrderPaymentEventAction, OrderStatus } from "@prisma/client";

type PaymentStatusBadgeProps = {
  status: OrderStatus;
  hasPaymentReceipt: boolean;
  paymentRejectionReason?: string | null;
  paymentEvents?: Array<{ action: OrderPaymentEventAction }>;
  /** Override derived status (e.g. optimistic UI after approve/reject). */
  override?: PaymentReviewStatus;
};

export function PaymentStatusBadge({
  status,
  hasPaymentReceipt,
  paymentRejectionReason,
  paymentEvents,
  override,
}: PaymentStatusBadgeProps) {
  const paymentStatus =
    override ??
    getPaymentReviewStatus({
      status,
      hasPaymentReceipt,
      paymentRejectionReason,
      paymentEvents,
    });

  return (
    <span className={PAYMENT_REVIEW_BADGE[paymentStatus]}>
      {PAYMENT_REVIEW_LABELS[paymentStatus]}
    </span>
  );
}