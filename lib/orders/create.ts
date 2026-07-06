import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import type { CheckoutInput } from "@/lib/orders/types";
import { formatOrderNumber } from "@/lib/order-number";
import { receiptWriteData } from "@/lib/orders/receipt-storage";
import { applyPromotionCode } from "@/lib/promotions/apply";
import type { ParsedReceipt } from "@/lib/uploads/receipt";

export async function createGuestOrder(
  businessId: string,
  input: CheckoutInput,
  receipt?: ParsedReceipt,
) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, isActive: true },
    select: { id: true, deliveryFee: true },
  });

  if (!business) throw new Error("Store not found.");

  const productIds = [...new Set(input.items.map((item) => item.productId))];

  const products = await prisma.product.findMany({
    where: { businessId, id: { in: productIds }, status: "ACTIVE" },
    include: { variants: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems: Array<{
    productId: string;
    variantId?: string;
    title: string;
    variantName?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }> = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("A product in your cart is no longer available.");

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;

    if (item.variantId && !variant) {
      throw new Error(`"${product.title}" variant is no longer available.`);
    }

    if (!item.variantId && product.variants.length > 0) {
      throw new Error(`"${product.title}" requires a variant selection.`);
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < item.quantity) {
      throw new Error(`Not enough stock for "${product.title}".`);
    }

    const unitPrice = variant?.price != null ? toNumber(variant.price) : toNumber(product.price);

    lineItems.push({
      productId: product.id,
      variantId: variant?.id,
      title: product.title,
      variantName: variant?.name,
      sku: variant?.sku ?? undefined,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
    });
  }

  const promoLines = lineItems.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }));

  let discountAmount = 0;
  let promotionId: string | undefined;
  let promotionCode: string | undefined;

  if (input.promotionCode) {
    const applied = await applyPromotionCode(businessId, input.promotionCode, promoLines);
    discountAmount = applied.discountAmount;
    promotionId = applied.promotionId;
    promotionCode = applied.code;

    if (applied.giftLine) {
      const giftProduct = await prisma.product.findFirst({
        where: { id: applied.giftLine.productId, businessId, status: "ACTIVE" },
        select: { id: true, title: true, stock: true },
      });

      if (!giftProduct || giftProduct.stock < 1) {
        throw new Error("The giveaway product is no longer available.");
      }

      lineItems.push({
        productId: giftProduct.id,
        title: `${giftProduct.title} (Free gift)`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);
  const deliveryFee = toNumber(business.deliveryFee);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.order.count({
    where: { businessId, createdAt: { gte: todayStart } },
  });

  const orderNumber = formatOrderNumber(todayCount + 1);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: {
        businessId_phone: { businessId, phone: input.customerPhone },
      },
      update: {
        name: input.customerName,
        address: input.customerAddress ?? null,
        email: input.email ?? null,
      },
      create: {
        businessId,
        name: input.customerName,
        phone: input.customerPhone,
        address: input.customerAddress ?? null,
        email: input.email ?? null,
      },
    });

    const order = await tx.order.create({
      data: {
        businessId,
        customerId: customer.id,
        orderNumber,
        status: "PENDING",
        subtotal,
        discountAmount,
        deliveryFee,
        total,
        paymentProvider: "MANUAL",
        promotionId,
        promotionCode,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress ?? null,
        notes: input.notes ?? null,
        ...(receipt ? receiptWriteData(receipt) : {}),
        items: {
          create: lineItems.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            title: line.title,
            variantName: line.variantName,
            sku: line.sku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.total,
          })),
        },
      },
      include: { items: true },
    });

    if (promotionId) {
      await tx.promotion.update({
        where: { id: promotionId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return order;
  });
}

export async function createGuestOrderWithNotify(
  businessId: string,
  input: CheckoutInput,
  receipt?: ParsedReceipt,
) {
  const order = await createGuestOrder(businessId, input, receipt);
  const { notifyNewOrder } = await import("@/lib/notifications/orders");
  await notifyNewOrder(order.id).catch(() => undefined);
  return order;
}