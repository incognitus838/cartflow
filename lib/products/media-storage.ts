import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { toPrismaBytes } from "@/lib/orders/receipt-storage";
import type { ParsedProductMedia } from "@/lib/uploads/product-media";

export function productMediaPublicUrl(assetId: string) {
  return `/api/products/media/${assetId}`;
}

export function isStoredProductMediaUrl(url: string) {
  return url.startsWith("/api/products/media/");
}

function blobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function uploadToBlob(businessId: string, media: ParsedProductMedia) {
  const pathname = `products/${businessId}/${Date.now()}-${media.filename}`;
  const blob = await put(pathname, media.data, {
    access: "public",
    contentType: media.mimeType,
    addRandomSuffix: true,
  });

  return {
    id: null as string | null,
    url: blob.url,
    mediaType: media.mediaType,
  };
}

export async function createProductMediaAsset(businessId: string, media: ParsedProductMedia) {
  if (blobStorageEnabled()) {
    return uploadToBlob(businessId, media);
  }

  const asset = await prisma.productMediaAsset.create({
    data: {
      businessId,
      data: toPrismaBytes(media.data),
      mimeType: media.mimeType,
      filename: media.filename,
    },
    select: { id: true, mimeType: true },
  });

  return {
    id: asset.id,
    url: productMediaPublicUrl(asset.id),
    mediaType: media.mediaType,
  };
}

export async function getProductMediaAsset(assetId: string) {
  return prisma.productMediaAsset.findUnique({
    where: { id: assetId },
    select: {
      id: true,
      data: true,
      mimeType: true,
      filename: true,
    },
  });
}

export function buildProductMediaResponse(asset: {
  data: Uint8Array | Buffer | null;
  mimeType: string;
  filename: string;
}) {
  if (!asset.data || asset.data.byteLength === 0) {
    return null;
  }

  const mimeType = asset.mimeType || "application/octet-stream";
  const filename = asset.filename || "product-media";
  const body = Buffer.from(asset.data);

  return new Response(body, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}