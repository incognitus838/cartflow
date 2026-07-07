export const MAX_PRODUCT_MEDIA = 12;

export type ProductMediaType = "IMAGE" | "VIDEO" | "GIF";

export type ProductMedia = {
  url: string;
  alt?: string | null;
  mediaType: ProductMediaType;
};

export function detectMediaType(url: string, mimeType?: string | null): ProductMediaType {
  if (mimeType === "image/gif") return "GIF";
  if (mimeType?.startsWith("video/")) return "VIDEO";
  if (mimeType?.startsWith("image/")) return "IMAGE";

  const path = url.toLowerCase().split("?")[0] ?? "";
  if (path.includes("/api/products/media/")) return "IMAGE";
  if (path.endsWith(".gif")) return "GIF";
  if (/\.(mp4|webm|mov|m4v|ogg)$/.test(path)) return "VIDEO";
  return "IMAGE";
}

export function normalizeMediaList(
  items: Array<{ url: string; mediaType?: ProductMediaType | string }>,
): ProductMedia[] {
  return items
    .map((item) => ({
      url: item.url.trim(),
      mediaType: (item.mediaType as ProductMediaType) || detectMediaType(item.url),
    }))
    .filter((item) => item.url.length > 0)
    .slice(0, MAX_PRODUCT_MEDIA);
}