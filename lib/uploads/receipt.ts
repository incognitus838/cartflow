import sharp from "sharp";

export const RECEIPT_MAX_BYTES = 500 * 1024;
const RECEIPT_IMAGE_MAX_EDGE = 1600;
const RECEIPT_JPEG_QUALITY = 80;

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

async function compressReceiptImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    const compressed = await sharp(buffer, { animated: mimeType === "image/gif" })
      .rotate()
      .resize({
        width: RECEIPT_IMAGE_MAX_EDGE,
        height: RECEIPT_IMAGE_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: RECEIPT_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[receipt] compressed ${buffer.byteLength} → ${compressed.byteLength} bytes`,
      );
    }

    return compressed;
  } catch {
    return buffer;
  }
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

  let buffer = Buffer.from(await file.arrayBuffer());
  let mimeType = file.type;
  let filename = file.name.trim() || defaultFilename(file.type);

  if (isReceiptImage(mimeType) && mimeType !== "image/gif") {
    buffer = await compressReceiptImage(buffer, mimeType);
    mimeType = "image/jpeg";
    filename = filename.replace(/\.[^.]+$/, "") + ".jpg";

    if (buffer.byteLength > RECEIPT_MAX_BYTES) {
      throw new Error(`Receipt must be under ${RECEIPT_MAX_LABEL} after compression.`);
    }
  }

  return {
    data: buffer,
    mimeType,
    filename,
  };
}

function defaultFilename(mimeType: string) {
  if (mimeType === "application/pdf") return "payment-receipt.pdf";
  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return `payment-receipt.${ext}`;
}