/**
 * Upload existing ProductMediaAsset rows to Vercel Blob and update ProductImage URLs.
 * Requires BLOB_READ_WRITE_TOKEN in env. Safe to re-run (skips non-DB URLs).
 */
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

function mediaApiPath(assetId) {
  return `/api/products/media/${assetId}`;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error("BLOB_READ_WRITE_TOKEN is required.");
    process.exit(1);
  }

  const assets = await prisma.productMediaAsset.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      businessId: true,
      data: true,
      mimeType: true,
      filename: true,
    },
  });

  console.log(`Found ${assets.length} DB media assets.`);

  let migrated = 0;
  let skipped = 0;

  for (const asset of assets) {
    const legacyUrl = mediaApiPath(asset.id);
    const images = await prisma.productImage.findMany({
      where: { url: legacyUrl },
      select: { id: true },
    });

    if (images.length === 0) {
      skipped += 1;
      continue;
    }

    const pathname = `products/${asset.businessId}/${asset.filename || asset.id}`;
    const blob = await put(pathname, Buffer.from(asset.data), {
      access: "public",
      contentType: asset.mimeType,
      addRandomSuffix: true,
    });

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { url: legacyUrl },
        data: { url: blob.url },
      }),
      prisma.productMediaAsset.delete({ where: { id: asset.id } }),
    ]);

    migrated += 1;
    console.log(`Migrated ${asset.id} → ${blob.url} (${images.length} image refs)`);
  }

  console.log(`Done. Migrated ${migrated}, skipped ${skipped} (no image refs).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());