import { prisma } from "@/lib/db";
import type { OrderStatus, ProductStatus } from "@prisma/client";

export async function getBusinessStats(businessId: string) {
  const [productCount, orderCount, pendingOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { businessId, status: "ACTIVE" } }),
    prisma.order.count({ where: { businessId } }),
    prisma.order.count({ where: { businessId, status: "PENDING" } }),
    prisma.order.aggregate({
      where: { businessId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

  return {
    productCount,
    orderCount,
    pendingOrders,
    revenue: revenue._sum.total,
  };
}

export async function listBusinessProducts(
  businessId: string,
  options?: { status?: ProductStatus; search?: string; limit?: number },
) {
  return prisma.product.findMany({
    where: {
      businessId,
      status: options?.status,
      OR: options?.search
        ? [
            { title: { contains: options.search, mode: "insensitive" } },
            { description: { contains: options.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    take: options?.limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      _count: { select: { variants: true } },
    },
  });
}

/** Lightweight sample for storefront designer preview (avoids loading huge catalogs). */
export const STOREFRONT_PREVIEW_PRODUCT_LIMIT = 8;

export async function listStorefrontPreviewProducts(businessId: string) {
  return listBusinessProducts(businessId, {
    status: "ACTIVE",
    limit: STOREFRONT_PREVIEW_PRODUCT_LIMIT,
  });
}

export async function countActiveBusinessProducts(businessId: string) {
  return prisma.product.count({ where: { businessId, status: "ACTIVE" } });
}

export async function getBusinessProduct(businessId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, businessId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listBusinessOrders(
  businessId: string,
  options?: { status?: OrderStatus; limit?: number; search?: string },
) {
  return prisma.order.findMany({
    where: {
      businessId,
      status: options?.status,
      OR: options?.search
        ? [
            { orderNumber: { contains: options.search, mode: "insensitive" } },
            { customerName: { contains: options.search, mode: "insensitive" } },
            { customerPhone: { contains: options.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
    include: {
      items: true,
      customer: true,
    },
  });
}

export async function getBusinessOrder(businessId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, businessId },
    include: {
      items: true,
      customer: true,
      notifications: { orderBy: { createdAt: "desc" }, take: 10 },
      paymentEvents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listBusinessPromotions(businessId: string) {
  return prisma.promotion.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: {
      giftProduct: { select: { id: true, title: true } },
      _count: { select: { orders: true } },
    },
  });
}

export async function getBusinessPromotion(businessId: string, promotionId: string) {
  return prisma.promotion.findFirst({
    where: { id: promotionId, businessId },
    include: {
      giftProduct: { select: { id: true, title: true } },
      _count: { select: { orders: true } },
    },
  });
}