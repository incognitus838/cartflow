import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type Tx = Prisma.TransactionClient;

/** Sum variant stock; product-level stock is the aggregate when variants exist. */
export function sumVariantStock(variants: Array<{ stock: number }>): number {
  return variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
}

/**
 * Keep product.stock aligned with variants.
 * Heals lone variant at 0 when product still has legacy product-level stock.
 */
export async function syncProductStockFromVariants(
  productId: string,
  tx: Tx = prisma,
): Promise<{ productStock: number; healedVariant?: string }> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      stock: true,
      variants: { select: { id: true, name: true, stock: true } },
    },
  });

  if (!product || product.variants.length === 0) {
    return { productStock: product?.stock ?? 0 };
  }

  let variants = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    stock: Math.max(0, v.stock),
  }));

  const variantTotal = sumVariantStock(variants);
  let healedVariant: string | undefined;

  if (
    variantTotal === 0 &&
    product.stock > 0 &&
    variants.length === 1
  ) {
    await tx.productVariant.update({
      where: { id: variants[0].id },
      data: { stock: product.stock },
    });
    variants = [{ ...variants[0], stock: product.stock }];
    healedVariant = variants[0].name;
  }

  const total = sumVariantStock(variants);

  if (product.stock !== total) {
    await tx.product.update({
      where: { id: productId },
      data: { stock: total },
    });
  }

  return { productStock: total, healedVariant };
}

export async function syncAllProductStockFromVariants(businessId?: string) {
  const products = await prisma.product.findMany({
    where: businessId ? { businessId } : undefined,
    select: { id: true, title: true },
  });

  let healed = 0;
  let synced = 0;

  for (const product of products) {
    const before = await prisma.product.findUnique({
      where: { id: product.id },
      select: { stock: true, variants: { select: { stock: true } } },
    });
    if (!before || before.variants.length === 0) continue;

    const result = await syncProductStockFromVariants(product.id);
    if (result.healedVariant) {
      healed += 1;
    } else {
      const variantTotal = sumVariantStock(
        before.variants.map((v) => ({ stock: v.stock })),
      );
      if (before.stock !== variantTotal || before.stock !== result.productStock) {
        synced += 1;
      }
    }
  }

  return { healed, synced, total: products.length };
}