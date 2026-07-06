import { prisma } from "@/lib/db";
import { receiptWriteData } from "@/lib/orders/receipt-storage";
import { parseReceiptFile, type ParsedReceipt } from "@/lib/uploads/receipt";

export async function attachReceiptToOrder(orderId: string, receipt: ParsedReceipt) {
  return prisma.order.update({
    where: { id: orderId },
    data: receiptWriteData(receipt),
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentReceiptMimeType: true,
      paymentReceiptFilename: true,
      paymentReceiptSubmittedAt: true,
    },
  });
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
    },
  });

  if (!order) throw new Error("Order not found.");

  if (order.status !== "PENDING") {
    throw new Error("This order can no longer accept a payment receipt.");
  }

  if (order.paymentReceiptData && order.paymentReceiptData.byteLength > 0) {
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