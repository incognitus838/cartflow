import { prisma } from "@/lib/db";
import { isLowStock } from "@/lib/inventory-stock";

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
  });
}