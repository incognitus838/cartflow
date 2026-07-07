import type { ProductMediaType } from "@/lib/media";

export const PRODUCT_MEDIA_MAX_BYTES = 8 * 1024 * 1024;

export const PRODUCT_MEDIA_ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export type ParsedProductMedia = {
  data: Buffer;
  mimeType: string;
  filename: string;
  mediaType: ProductMediaType;
};

export async function parseProductMediaFile(file: File): Promise<ParsedProductMedia> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  if (!PRODUCT_MEDIA_ALLOWED.has(file.type)) {
    throw new Error("Upload JPG, PNG, WebP, GIF, MP4, or WebM.");
  }

  if (file.size > PRODUCT_MEDIA_MAX_BYTES) {
    throw new Error("File must be under 8 MB.");
  }

  const ext = extensionForMime(file.type);
  const safeBase = (file.name || `upload.${ext}`)
    .replace(/[^\w.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return {
    data: Buffer.from(await file.arrayBuffer()),
    mimeType: file.type,
    filename: safeBase || `upload.${ext}`,
    mediaType: mediaTypeForMime(file.type),
  };
}

export function mediaTypeForMime(mimeType: string): ProductMediaType {
  if (mimeType === "image/gif") return "GIF";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}

export function extensionForMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}