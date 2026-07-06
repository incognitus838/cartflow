import type { ProductStatus } from "@prisma/client";
import {
  detectMediaType,
  MAX_PRODUCT_MEDIA,
  normalizeMediaList,
  type ProductMedia,
} from "@/lib/media";
import type { ProductInput } from "@/lib/products/types";

const STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

function parseMedia(data: Record<string, unknown>): ProductMedia[] | string {
  if (Array.isArray(data.media)) {
    const parsed = data.media
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const url = typeof row.url === "string" ? row.url.trim() : "";
        if (!url) return null;
        const mediaType =
          typeof row.mediaType === "string" &&
          ["IMAGE", "VIDEO", "GIF"].includes(row.mediaType)
            ? (row.mediaType as ProductMedia["mediaType"])
            : detectMediaType(url);
        return { url, mediaType };
      })
      .filter((item): item is ProductMedia => item !== null);

    if (parsed.length > MAX_PRODUCT_MEDIA) {
      return `Maximum ${MAX_PRODUCT_MEDIA} photos, videos, or GIFs per product.`;
    }
    return normalizeMediaList(parsed);
  }

  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls
        .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        .map((url) => url.trim())
    : [];

  if (imageUrls.length > MAX_PRODUCT_MEDIA) {
    return `Maximum ${MAX_PRODUCT_MEDIA} photos, videos, or GIFs per product.`;
  }

  return normalizeMediaList(imageUrls.map((url) => ({ url })));
}

export function parseProductInput(body: unknown): ProductInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const status = typeof data.status === "string" ? data.status : "DRAFT";
  const price = Number(data.price);
  const compareAtPrice =
    data.compareAtPrice === null || data.compareAtPrice === undefined || data.compareAtPrice === ""
      ? null
      : Number(data.compareAtPrice);
  const stock = Number(data.stock ?? 0);
  const lowStockThreshold = Number(data.lowStockThreshold ?? 5);

  if (!title || title.length < 2) return "Product title is required.";
  if (!Number.isFinite(price) || price < 0) return "Enter a valid price.";
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
    return "Enter a valid compare-at price.";
  }
  if (!STATUSES.includes(status as ProductStatus)) return "Invalid product status.";
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative integer.";
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return "Low-stock threshold must be a non-negative integer.";
  }

  const mediaResult = parseMedia(data);
  if (typeof mediaResult === "string") return mediaResult;

  let variants;
  try {
    variants = Array.isArray(data.variants)
      ? data.variants.map((v, index) => {
          const row = v as Record<string, unknown>;
          const name = typeof row.name === "string" ? row.name.trim() : "";
          const sku = typeof row.sku === "string" ? row.sku.trim() : "";
          const variantPrice =
            row.price === null || row.price === undefined || row.price === ""
              ? null
              : Number(row.price);
          const variantStock = Number(row.stock ?? 0);
          const id = typeof row.id === "string" ? row.id : undefined;

          if (!name) throw new Error(`Variant ${index + 1} needs a name.`);
          if (variantPrice !== null && (!Number.isFinite(variantPrice) || variantPrice < 0)) {
            throw new Error(`Variant ${index + 1} has an invalid price.`);
          }
          if (!Number.isInteger(variantStock) || variantStock < 0) {
            throw new Error(`Variant ${index + 1} stock must be non-negative.`);
          }

          return { id, name, sku: sku || undefined, price: variantPrice, stock: variantStock };
        })
      : [];
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid variants.";
  }

  if (variants.length > 0 && stock > 0) {
    return "When using variants, set product-level stock to 0.";
  }

  return {
    title,
    description: description || undefined,
    price,
    compareAtPrice,
    status: status as ProductStatus,
    stock: variants.length > 0 ? 0 : stock,
    lowStockThreshold,
    media: mediaResult,
    variants,
  };
}