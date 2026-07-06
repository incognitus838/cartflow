export const RECEIPT_MAX_BYTES = 500 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export const RECEIPT_MAX_LABEL = "500 KB";

export type ParsedReceipt = {
  data: Buffer;
  mimeType: string;
  filename: string;
};

export function isReceiptMimeType(mimeType: string) {
  return ALLOWED_TYPES.has(mimeType);
}

export function isReceiptImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

/** Validates and reads a receipt file into memory — never writes to disk. */
export async function parseReceiptFile(file: File): Promise<ParsedReceipt> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please upload your payment receipt.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, GIF screenshot, or PDF receipt.");
  }

  if (file.size > RECEIPT_MAX_BYTES) {
    throw new Error(`Receipt must be under ${RECEIPT_MAX_LABEL}.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.trim() || defaultFilename(file.type);

  return {
    data: buffer,
    mimeType: file.type,
    filename,
  };
}

function defaultFilename(mimeType: string) {
  if (mimeType === "application/pdf") return "payment-receipt.pdf";
  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return `payment-receipt.${ext}`;
}