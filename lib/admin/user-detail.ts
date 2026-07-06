import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import { FULFILLED_STATUSES } from "@/lib/admin/metrics";

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedBusinesses: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { products: true, orders: true, customers: true, promotions: true } },
          orders: {
            where: { status: { in: [...FULFILLED_STATUSES] } },
            select: { total: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      memberships: {
        orderBy: { createdAt: "asc" },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              isActive: true,
              subscriptionStatus: true,
              planStartedAt: true,
              createdAt: true,
              owner: { select: { id: true, name: true, email: true } },
              _count: { select: { products: true, orders: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  let totalGmv = 0;
  let fulfilledOrderCount = 0;

  const stores = user.ownedBusinesses.map((store) => {
    const storeGmv = store.orders.reduce((sum, o) => sum + toNumber(o.total), 0);
    const storeOrderCount = store.orders.length;
    totalGmv += storeGmv;
    fulfilledOrderCount += storeOrderCount;

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      plan: store.plan,
      subscriptionStatus: store.subscriptionStatus,
      planStartedAt: store.planStartedAt?.toISOString() ?? null,
      isActive: store.isActive,
      currency: store.currency,
      createdAt: store.createdAt.toISOString(),
      gmv: storeGmv,
      fulfilledOrders: storeOrderCount,
      _count: store._count,
    };
  });

  let earliestSale: Date | null = null;
  for (const store of user.ownedBusinesses) {
    if (store.orders.length === 0) continue;
    const storeFirst = store.orders[0].createdAt;
    if (earliestSale === null || storeFirst < earliestSale) {
      earliestSale = storeFirst;
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isSuspended: user.isSuspended,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    suspendReason: user.suspendReason,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    daysOnPlatform: Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    ),
    firstSaleAt: earliestSale === null ? null : earliestSale.toISOString(),
    totalGmv,
    fulfilledOrderCount,
    stores,
    memberships: user.memberships.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt.toISOString(),
      business: {
        ...m.business,
        createdAt: m.business.createdAt.toISOString(),
        planStartedAt: m.business.planStartedAt?.toISOString() ?? null,
      },
    })),
    _count: {
      ownedBusinesses: user.ownedBusinesses.length,
      memberships: user.memberships.length,
    },
  };
}

export async function suspendAdminUser(userId: string, reason?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  if (user.role === "ADMIN") throw new Error("Cannot suspend platform admins.");

  return prisma.$transaction(async (tx) => {
    await tx.business.updateMany({
      where: { ownerId: userId },
      data: { isActive: false },
    });
    return tx.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendReason: reason?.trim() || "Suspended by platform admin",
      },
    });
  });
}

export async function unsuspendAdminUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.business.updateMany({
      where: { ownerId: userId },
      data: { isActive: true },
    });
    return tx.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendReason: null,
      },
    });
  });
}