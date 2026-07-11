import { Prisma } from "@prisma/client";
import { syncCatalogFromProduct } from "@/lib/catalog/sync-from-product";
import { prisma } from "@/lib/db";
import { canAddProduct } from "@/lib/plans";
import { normalizeCategoryName } from "@/lib/products/catalog-layout";
import { syncProductStockFromVariants } from "@/lib/products/sync-stock";
import type { ProductInput } from "@/lib/products/types";
import { scopedProductWhere } from "@/lib/tenant";

async function nextSortOrderInCategory(
  tx: Prisma.TransactionClient,
  businessId: string,
  category: string,
) {
  const normalized = normalizeCategoryName(category);
  const result = await tx.product.aggregate({
    where: { businessId, category: normalized },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

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
    const category = normalizeCategoryName(input.category);
    const sortOrder = await nextSortOrderInCategory(tx, businessId, category);

    const product = await tx.product.create({
      data: {
        businessId,
        title: input.title,
        description: input.description,
        category,
        sortOrder,
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

    if (product.variants.length > 0) {
      await syncProductStockFromVariants(product.id, tx);
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

    const nextCategory = normalizeCategoryName(input.category);
    const categoryChanged = normalizeCategoryName(existing.category) !== nextCategory;
    const nextSortOrder = categoryChanged
      ? await nextSortOrderInCategory(tx, businessId, nextCategory)
      : undefined;

    const product = await tx.product.update({
      where: { id: productId },
      data: {
        title: input.title,
        description: input.description,
        category: nextCategory,
        sortOrder: nextSortOrder,
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

    if (product.variants.length > 0) {
      await syncProductStockFromVariants(product.id, tx);
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

export async function moveProductToCategory(
  businessId: string,
  productId: string,
  category: string,
) {
  const normalized = normalizeCategoryName(category);
  const existing = await prisma.product.findFirst({
    where: scopedProductWhere(businessId, productId),
    select: { id: true, category: true, metadata: true },
  });
  if (!existing) throw new Error("Product not found");
  if (normalizeCategoryName(existing.category) === normalized) {
    return prisma.product.findFirstOrThrow({ where: { id: productId } });
  }

  return prisma.$transaction(async (tx) => {
    const sortOrder = await nextSortOrderInCategory(tx, businessId, normalized);
    const product = await tx.product.update({
      where: { id: productId },
      data: { category: normalized, sortOrder },
    });

    await syncCatalogFromProduct(
      businessId,
      { category: normalized, metadata: existing.metadata },
      tx,
    );

    return product;
  });
}

export async function moveProductsToCategory(
  businessId: string,
  productIds: string[],
  category: string,
) {
  const normalized = normalizeCategoryName(category);
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length === 0) {
    return { moved: 0, skipped: 0 };
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { businessId, id: { in: uniqueIds } },
      select: { id: true, category: true, metadata: true },
    });

    if (products.length === 0) {
      throw new Error("No products found.");
    }

    let sortOrder = await nextSortOrderInCategory(tx, businessId, normalized);
    let moved = 0;
    let skipped = 0;

    for (const product of products) {
      if (normalizeCategoryName(product.category) === normalized) {
        skipped += 1;
        continue;
      }

      await tx.product.update({
        where: { id: product.id },
        data: { category: normalized, sortOrder },
      });
      sortOrder += 1;
      moved += 1;

      await syncCatalogFromProduct(
        businessId,
        { category: normalized, metadata: product.metadata },
        tx,
      );
    }

    return { moved, skipped };
  });
}

export async function reorderProductInCategory(
  businessId: string,
  productId: string,
  direction: "up" | "down",
) {
  const product = await prisma.product.findFirst({
    where: scopedProductWhere(businessId, productId),
    select: { id: true, category: true, sortOrder: true },
  });
  if (!product) throw new Error("Product not found");

  const category = normalizeCategoryName(product.category);
  const siblings = await prisma.product.findMany({
    where: { businessId, category },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: { id: true, sortOrder: true },
  });

  const index = siblings.findIndex((row) => row.id === productId);
  if (index < 0) throw new Error("Product not found");

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return product;
  }

  const current = siblings[index];
  const neighbor = siblings[targetIndex];

  await prisma.$transaction([
    prisma.product.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.product.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  return prisma.product.findFirst({
    where: { id: productId },
    select: { id: true, category: true, sortOrder: true },
  });
}