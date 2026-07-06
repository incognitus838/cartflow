import type { ParsedReceipt } from "@/lib/uploads/receipt";

export type OrderReceiptMeta = {
  hasReceipt: boolean;
  mimeType: string | null;
  filename: string | null;
  submittedAt: Date | null;
  isImage: boolean;
};

/** Prisma Bytes fields expect Uint8Array — copy Node Buffer into a plain typed array. */
export function toPrismaBytes(data: Buffer | Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy;
}

export function orderHasReceipt(order: {
  paymentReceiptData: Uint8Array | Buffer | null;
  paymentReceiptMimeType?: string | null;
}) {
  return Boolean(order.paymentReceiptData && order.paymentReceiptData.byteLength > 0);
}

export function receiptMetaFromOrder(order: {
  paymentReceiptData: Uint8Array | Buffer | null;
  paymentReceiptMimeType: string | null;
  paymentReceiptFilename: string | null;
  paymentReceiptSubmittedAt: Date | null;
}): OrderReceiptMeta {
  const hasReceipt = orderHasReceipt(order);
  const mimeType = order.paymentReceiptMimeType;

  return {
    hasReceipt,
    mimeType,
    filename: order.paymentReceiptFilename,
    submittedAt: order.paymentReceiptSubmittedAt,
    isImage: Boolean(mimeType?.startsWith("image/")),
  };
}

export function receiptWriteData(receipt: ParsedReceipt) {
  return {
    paymentReceiptData: toPrismaBytes(receipt.data),
    paymentReceiptMimeType: receipt.mimeType,
    paymentReceiptFilename: receipt.filename,
    paymentReceiptSubmittedAt: new Date(),
  };
}