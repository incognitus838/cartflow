import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import type { OrderStatus } from "@prisma/client";

export async function getBusinessAnalytics(businessId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [orders, statusGroups, topItems] = await Promise.all([
    prisma.order.findMany({
      where: { businessId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { businessId },
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ["title"],
      where: { order: { businessId } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const revenue =
      ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
        ? toNumber(order.total)
        : 0;
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + revenue);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  const daily = Array.from(revenueByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date,
      revenue,
      orders: ordersByDay.get(date) ?? 0,
    }));

  const totalRevenue = orders.reduce((sum, order) => {
    if (!["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) return sum;
    return sum + toNumber(order.total);
  }, 0);

  const statusBreakdown = statusGroups.map((row) => ({
    status: row.status as OrderStatus,
    count: row._count._all,
  }));

  const topProducts = topItems.map((row) => ({
    title: row.title,
    quantity: row._sum.quantity ?? 0,
    revenue: toNumber(row._sum.total),
  }));

  return {
    periodDays: 30,
    totalRevenue,
    totalOrders: orders.length,
    daily,
    statusBreakdown,
    topProducts,
  };
}