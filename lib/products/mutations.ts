import { Prisma } from "@prisma/client";
import { syncCatalogFromProduct } from "@/lib/catalog/sync-from-product";
import { prisma } from "@/lib/db";
import { canAddProduct } from "@/lib/plans";
import type { ProductInput } from "@/lib/products/types";
import { scopedProductWhere } from "@/lib/tenant";

function resolvedProductStock(input: ProductInput) {
  if (input.variants.length > 0) {
    return input.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  return input.stock;
}

export async function createProduct(businessId: string, input: ProductInput) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true, _count: { select: { products: true } } },
  });
  if (!business) throw new Error("Store not found");
  if (!canAddProduct(business.plan, business._count.products)) {
    throw new Error("Product limit reached. Upgrade your plan to add more products.");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        businessId,
        title: input.title,
        description: input.description,
        category: input.category ?? "General",
        metadata: input.metadata,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        status: input.status,
        stock: resolvedProductStock(input),
        lowStockThreshold: input.lowStockThreshold,
        images: {
          create: input.media.map((item, index) => ({
            url: item.url,
            mediaType: item.mediaType,
            sortOrder: index,
          })),
        },
        variants: {
          create: input.variants.map((variant) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          })),
        },
      },
      include: { images: true, variants: true },
    });

    if (input.variants.length > 0) {
      const totalVariantStock = input.variants.reduce((sum, v) => sum + v.stock, 0);
      await tx.inventoryLog.create({
        data: {
          businessId,
          productId: product.id,
          change: totalVariantStock,
          reason: "initial_stock",
          reference: product.id,
        },
      });
    } else if (input.stock > 0) {
      await tx.inventoryLog.create({
        data: {
          businessId,
          productId: product.id,
          change: input.stock,
          reason: "initial_stock",
          reference: product.id,
        },
      });
    }

    await syncCatalogFromProduct(businessId, {
      category: input.category,
      metadata: input.metadata,
    }, tx);

    return product;
  });
}

export async function updateProduct(
  businessId: string,
  productId: string,
  input: ProductInput,
) {
  const existing = await prisma.product.findFirst({
    where: scopedProductWhere(businessId, productId),
    include: { variants: true, images: true },
  });

  if (!existing) throw new Error("Product not found");

  const oldTotalStock =
    existing.variants.length > 0
      ? existing.variants.reduce((sum, v) => sum + v.stock, 0)
      : existing.stock;

  const newTotalStock = resolvedProductStock(input);

  return prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });

    const incomingIds = new Set(
      input.variants.map((v) => v.id).filter((id): id is string => Boolean(id)),
    );

    const toDelete = existing.variants.filter((v) => !incomingIds.has(v.id));
    if (toDelete.length > 0) {
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete.map((v) => v.id) } },
      });
    }

    for (const variant of input.variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          },
        });
      }
    }

    const product = await tx.product.update({
      where: { id: productId },
      data: {
        title: input.title,
        description: input.description,
        category: input.category ?? "General",
        metadata: input.metadata,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        status: input.status,
        stock: newTotalStock,
        lowStockThreshold: input.lowStockThreshold,
        images: {
          create: input.media.map((item, index) => ({
            url: item.url,
            mediaType: item.mediaType,
            sortOrder: index,
          })),
        },
      },
      include: { images: true, variants: true },
    });

    const stockDelta = newTotalStock - oldTotalStock;
    if (stockDelta !== 0) {
      await tx.inventoryLog.create({
        data: {
          businessId,
          productId,
          change: stockDelta,
          reason: "manual_adjustment",
          reference: productId,
        },
      });
    }

    await syncCatalogFromProduct(businessId, {
      category: input.category,
      metadata: input.metadata,
    }, tx);

    return product;
  });
}

export async function deleteProduct(businessId: string, productId: string) {
  const existing = await prisma.product.findFirst({
    where: scopedProductWhere(businessId, productId),
  });
  if (!existing) throw new Error("Product not found");
  await prisma.product.delete({ where: { id: productId } });
}