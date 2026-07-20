import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";

const FULFILLED_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

/** Platform accounts tied to a store or admin access — excludes abandoned signups. */
const STORE_CONNECTED_USER_WHERE = {
  OR: [
    { role: "ADMIN" as const },
    { ownedBusinesses: { some: {} } },
    { memberships: { some: {} } },
  ],
};

export async function getAdminStats() {
  const [businesses, users, orders, revenue, recentBusinesses, recentOrders] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: STORE_CONNECTED_USER_WHERE }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: [...FULFILLED_STATUSES] } },
      _sum: { total: true },
    }),
    prisma.business.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        isSuspended: true,
        approvalStatus: true,
        submittedAt: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        business: { select: { id: true, name: true, slug: true, currency: true } },
      },
    }),
  ]);

  const planBreakdown = await prisma.business.groupBy({
    by: ["plan"],
    where: { deletedAt: null },
    _count: { _all: true },
  });

  const statusBreakdown = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const [pendingOrders, pendingStoreApprovals] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.business.count({ where: { approvalStatus: "PENDING", deletedAt: null } }),
  ]);

  return {
    businesses,
    users,
    orders,
    pendingOrders,
    pendingStoreApprovals,
    revenue: toNumber(revenue._sum.total),
    planBreakdown: planBreakdown.map((row) => ({
      plan: row.plan,
      count: row._count._all,
    })),
    statusBreakdown: statusBreakdown.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    recentBusinesses,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: toNumber(order.total),
    })),
  };
}

export async function listAdminBusinesses(options?: { search?: string; take?: number }) {
  const search = options?.search?.trim();
  const take = options?.take ?? 100;

  return prisma.business.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { owner: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      isActive: true,
      isSuspended: true,
      suspendedAt: true,
      suspendReason: true,
      approvalStatus: true,
      submittedAt: true,
      createdAt: true,
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
  });
}

export async function getAdminUserStats() {
  const [total, roleBreakdown, ownersWithStores, staffOnly] = await Promise.all([
    prisma.user.count({ where: STORE_CONNECTED_USER_WHERE }),
    prisma.user.groupBy({
      by: ["role"],
      where: STORE_CONNECTED_USER_WHERE,
      _count: { _all: true },
    }),
    prisma.user.count({ where: { ownedBusinesses: { some: {} } } }),
    prisma.user.count({
      where: { ownedBusinesses: { none: {} }, memberships: { some: {} } },
    }),
  ]);

  return {
    total,
    ownersWithStores,
    staffOnly,
    roleBreakdown: roleBreakdown.map((row) => ({
      role: row.role,
      count: row._count._all,
    })),
  };
}

export async function listAdminUsers(options?: { search?: string; take?: number }) {
  const search = options?.search?.trim();
  const take = options?.take ?? 200;

  return prisma.user.findMany({
    where: {
      AND: [
        STORE_CONNECTED_USER_WHERE,
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { ownedBusinesses: { some: { name: { contains: search, mode: "insensitive" } } } },
                { ownedBusinesses: { some: { slug: { contains: search, mode: "insensitive" } } } },
                {
                  memberships: {
                    some: { business: { name: { contains: search, mode: "insensitive" } } },
                  },
                },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      ownedBusinesses: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          isActive: true,
          subscriptionStatus: true,
          planStartedAt: true,
          currency: true,
          phone: true,
          whatsapp: true,
          bankAccountNumber: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { products: true, orders: true, customers: true, promotions: true },
          },
        },
      },
      memberships: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          createdAt: true,
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              isActive: true,
              owner: { select: { id: true, name: true, email: true } },
              _count: { select: { products: true, orders: true } },
            },
          },
        },
      },
      _count: { select: { ownedBusinesses: true, memberships: true } },
    },
  });
}

export async function listAdminOrders(options?: { status?: string; take?: number }) {
  const take = options?.take ?? 100;

  const orders = await prisma.order.findMany({
    where: options?.status ? { status: options.status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      business: { select: { id: true, name: true, slug: true, currency: true } },
    },
  });

  return orders.map((order) => ({
    ...order,
    total: toNumber(order.total),
    subtotal: toNumber(order.subtotal),
  }));
}

export async function setBusinessActive(businessId: string, isActive: boolean) {
  return prisma.business.update({
    where: { id: businessId },
    data: { isActive },
  });
}

export async function setBusinessPlan(businessId: string, plan: string) {
  return prisma.business.update({
    where: { id: businessId },
    data: { plan: plan as never },
  });
}