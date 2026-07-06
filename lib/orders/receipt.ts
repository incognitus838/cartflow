import { prisma } from "@/lib/db";
import { logOrderPaymentEvent } from "@/lib/orders/payment-events";
import { receiptWriteData } from "@/lib/orders/receipt-storage";
import { parseReceiptFile, type ParsedReceipt } from "@/lib/uploads/receipt";

export async function attachReceiptToOrder(orderId: string, receipt: ParsedReceipt) {
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        ...receiptWriteData(receipt),
        paymentRejectionReason: null,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentReceiptMimeType: true,
        paymentReceiptFilename: true,
        paymentReceiptSubmittedAt: true,
      },
    });

    await logOrderPaymentEvent(orderId, "RECEIPT_SUBMITTED", undefined, tx);
    return updated;
  });

  return order;
}

export async function submitOrderReceipt(
  businessId: string,
  orderNumber: string,
  file: File,
) {
  const order = await prisma.order.findFirst({
    where: { businessId, orderNumber },
    select: {
      id: true,
      status: true,
      paymentReceiptData: true,
      paymentRejectionReason: true,
    },
  });

  if (!order) throw new Error("Order not found.");

  if (order.status !== "PENDING") {
    throw new Error("This order can no longer accept a payment receipt.");
  }

  const hasReceipt = Boolean(order.paymentReceiptData && order.paymentReceiptData.byteLength > 0);
  const canResubmit = Boolean(order.paymentRejectionReason);

  if (hasReceipt && !canResubmit) {
    throw new Error("A payment receipt has already been submitted for this order.");
  }

  const receipt = await parseReceiptFile(file);
  return attachReceiptToOrder(order.id, receipt);
}

export async function getOrderReceiptBlob(businessId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, businessId },
    select: {
      paymentReceiptData: true,
      paymentReceiptMimeType: true,
      paymentReceiptFilename: true,
    },
  });
}

export async function getStorefrontOrderReceiptBlob(businessId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { businessId, orderNumber },
    select: {
      paymentReceiptData: true,
      paymentReceiptMimeType: true,
      paymentReceiptFilename: true,
    },
  });
}