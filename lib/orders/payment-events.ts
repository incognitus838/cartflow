import "server-only";

import type { OrderPaymentEventAction } from "@prisma/client";
import { prisma } from "@/lib/db";

type PaymentEventClient = Pick<typeof prisma, "orderPaymentEvent">;

export async function logOrderPaymentEvent(
  orderId: string,
  action: OrderPaymentEventAction,
  options?: { reason?: string; actorName?: string },
  client: PaymentEventClient = prisma,
) {
  return client.orderPaymentEvent.create({
    data: {
      orderId,
      action,
      reason: options?.reason?.trim() || null,
      actorName: options?.actorName?.trim() || null,
    },
  });
}

export function clearReceiptFields() {
  return {
    paymentReceiptData: null,
    paymentReceiptMimeType: null,
    paymentReceiptFilename: null,
    paymentReceiptSubmittedAt: null,
  };
}