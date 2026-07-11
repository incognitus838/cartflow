import { prisma } from "@/lib/db";
import { isLowStock } from "@/lib/inventory-stock";
import { syncProductStockFromVariants } from "@/lib/products/sync-stock";

export { getProductStock, isLowStock, isOutOfStock } from "@/lib/inventory-stock";

type DeductStockInput = {
  businessId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  reason: string;
  reference?: string;
};

export async function getLowStockProducts(businessId: string) {
  const products = await prisma.product.findMany({
    where: { businessId, status: { in: ["ACTIVE", "DRAFT"] } },
    include: { variants: true },
  });

  return products.filter(isLowStock);
}

export async function deductStockForOrder(
  businessId: string,
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>,
  reference: string,
  autoDeductInventory: boolean,
) {
  if (!autoDeductInventory) return;

  for (const item of items) {
    await deductStock({
      businessId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      reason: "order_fulfilled",
      reference,
    });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true },
  });

  if (business?.slug) {
    const { revalidateStorefrontCatalog } = await import("@/lib/storefront/revalidate-catalog");
    revalidateStorefrontCatalog(businessId, business.slug);
  }
}

export async function deductStock(input: DeductStockInput) {
  const { businessId, productId, variantId, quantity, reason, reference } = input;

  return prisma.$transaction(async (tx) => {
    if (variantId) {
      const variant = await tx.productVariant.findFirst({
        where: { id: variantId, productId, product: { businessId } },
      });

      if (!variant) throw new Error("Variant not found");
      if (variant.stock < quantity) throw new Error("Insufficient variant stock");

      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { decrement: quantity } },
      });
    } else {
      const product = await tx.product.findFirst({
        where: { id: productId, businessId },
        include: { variants: true },
      });

      if (!product) throw new Error("Product not found");
      if (product.variants.length > 0) {
        throw new Error("This product uses variants — deduct variant stock instead.");
      }
      if (product.stock < quantity) throw new Error("Insufficient product stock");

      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });
    }

    await tx.inventoryLog.create({
      data: {
        businessId,
        productId,
        variantId: variantId ?? null,
        change: -quantity,
        reason,
        reference,
      },
    });

    await syncProductStockFromVariants(productId, tx);
  });
}

export async function restoreStockForOrder(
  businessId: string,
  orderId: string,
  autoDeductInventory: boolean,
) {
  if (!autoDeductInventory) return;

  const fulfilledLogs = await prisma.inventoryLog.findMany({
    where: {
      businessId,
      reference: orderId,
      reason: "order_fulfilled",
    },
  });

  if (fulfilledLogs.length === 0) return;

  const alreadyRestored = await prisma.inventoryLog.count({
    where: {
      businessId,
      reference: orderId,
      reason: "order_refunded",
    },
  });

  if (alreadyRestored > 0) return;

  for (const log of fulfilledLogs) {
    const quantity = Math.abs(log.change);
    if (quantity <= 0) continue;

    await prisma.$transaction(async (tx) => {
      if (log.variantId) {
        await tx.productVariant.update({
          where: { id: log.variantId },
          data: { stock: { increment: quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: log.productId },
          data: { stock: { increment: quantity } },
        });
      }

      await tx.inventoryLog.create({
        data: {
          businessId,
          productId: log.productId,
          variantId: log.variantId,
          change: quantity,
          reason: "order_refunded",
          reference: orderId,
        },
      });

      await syncProductStockFromVariants(log.productId, tx);
    });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true },
  });

  if (business?.slug) {
    const { revalidateStorefrontCatalog } = await import("@/lib/storefront/revalidate-catalog");
    revalidateStorefrontCatalog(businessId, business.slug);
  }
}