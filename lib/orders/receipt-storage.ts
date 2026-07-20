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

/** Length of a Prisma Bytes / Buffer / Uint8Array / serialized Buffer payload. */
export function receiptByteLength(data: unknown): number {
  if (data == null) return 0;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) return data.length;
  if (data instanceof Uint8Array) return data.byteLength;
  if (typeof data === "string") return data.length;
  if (typeof data === "object") {
    const value = data as Record<string, unknown>;
    if (typeof value.byteLength === "number" && Number.isFinite(value.byteLength)) {
      return value.byteLength;
    }
    if (typeof value.length === "number" && Number.isFinite(value.length)) {
      return value.length;
    }
    // Node JSON Buffer shape: { type: "Buffer", data: number[] }
    if (value.type === "Buffer" && Array.isArray(value.data)) {
      return value.data.length;
    }
  }
  return 0;
}

/**
 * Whether this order has a payment receipt.
 * Prefers raw bytes, but also trusts submitted metadata so approve is not blocked
 * when Prisma Bytes come back in an unexpected shape on some runtimes.
 */
export function orderHasReceipt(order: {
  paymentReceiptData?: unknown;
  paymentReceiptMimeType?: string | null;
  paymentReceiptFilename?: string | null;
  paymentReceiptSubmittedAt?: Date | string | null;
}) {
  if (receiptByteLength(order.paymentReceiptData) > 0) return true;
  if (order.paymentReceiptSubmittedAt) return true;
  if (order.paymentReceiptMimeType && order.paymentReceiptFilename) return true;
  return false;
}

export function receiptMetaFromOrder(order: {
  paymentReceiptData?: unknown;
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