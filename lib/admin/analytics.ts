import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import {
  classifySellerHealth,
  FULFILLED_STATUSES,
  type SellerHealthTier,
} from "@/lib/admin/metrics";

export type PeriodDays = 7 | 30 | 90;

function periodStart(days: PeriodDays) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
}

function previousPeriodStart(days: PeriodDays) {
  const since = new Date();
  since.setDate(since.getDate() - days * 2);
  since.setHours(0, 0, 0, 0);
  return since;
}

export async function getPlatformAnalytics(periodDays: PeriodDays = 30) {
  const since = periodStart(periodDays);
  const prevSince = previousPeriodStart(periodDays);

  const [
    ordersInPeriod,
    fulfilledCurrent,
    fulfilledPrevious,
    pendingWithReceipt,
    totalCustomers,
    customerOrderCounts,
    businesses,
    gmvByBusiness,
    ordersByDay,
    planGroups,
    statusGroups,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { businessId: true, createdAt: true, status: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: since }, status: { in: [...FULFILLED_STATUSES] } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: prevSince, lt: since },
        status: { in: [...FULFILLED_STATUSES] },
      },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.count({
      where: {
        status: "PENDING",
        paymentReceiptSubmittedAt: { not: null },
      },
    }),
    prisma.customer.count(),
    prisma.customer.findMany({
      select: { id: true, _count: { select: { orders: true } } },
    }),
    prisma.business.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        bankAccountNumber: true,
        createdAt: true,
        owner: { select: { name: true, email: true } },
        _count: { select: { products: true, orders: true, customers: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.order.groupBy({
      by: ["businessId"],
      where: { createdAt: { gte: since }, status: { in: [...FULFILLED_STATUSES] } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.business.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const gmv = toNumber(fulfilledCurrent._sum.total);
  const prevGmv = toNumber(fulfilledPrevious._sum.total);
  const fulfilledCount = fulfilledCurrent._count._all;
  const prevFulfilledCount = fulfilledPrevious._count._all;

  const activeSellerIds = new Set(ordersInPeriod.map((o) => o.businessId));
  const activeSellers = activeSellerIds.size;

  const gmvMap = new Map(
    gmvByBusiness.map((row) => [
      row.businessId,
      { gmv: toNumber(row._sum.total), orders: row._count._all },
    ]),
  );

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of ordersByDay) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    entry.orders += 1;
    if (FULFILLED_STATUSES.includes(order.status as (typeof FULFILLED_STATUSES)[number])) {
      entry.revenue += toNumber(order.total);
    }
    dailyMap.set(key, entry);
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, row]) => ({ date, ...row }));

  const customersWithOrders = customerOrderCounts.filter((c) => c._count.orders > 0);
  const repeatCustomers = customersWithOrders.filter((c) => c._count.orders >= 2);
  const repeatCustomerRate =
    customersWithOrders.length > 0 ? repeatCustomers.length / customersWithOrders.length : 0;

  const newCustomers = await prisma.customer.count({ where: { createdAt: { gte: since } } });

  const sellerHealth: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    isActive: boolean;
    ownerName: string;
    ownerEmail: string;
    tier: SellerHealthTier;
    productCount: number;
    orderCount: number;
    customerCount: number;
    periodGmv: number;
    periodOrders: number;
    hasBank: boolean;
    lastOrderAt: string | null;
    createdAt: string;
  }> = [];

  const tierCounts: Record<SellerHealthTier, number> = {
    thriving: 0,
    active: 0,
    at_risk: 0,
    dormant: 0,
    activating: 0,
    inactive: 0,
  };

  let dormantSellers = 0;
  let activatingSellers = 0;
  let storesWithBank = 0;
  let storesWithProducts = 0;
  let storesWithSales = 0;

  for (const business of businesses) {
    const lastOrderAt = business.orders[0]?.createdAt ?? null;
    const tier = classifySellerHealth({
      isActive: business.isActive,
      productCount: business._count.products,
      orderCount: business._count.orders,
      lastOrderAt,
      createdAt: business.createdAt,
    });
    tierCounts[tier] += 1;
    if (tier === "dormant" || tier === "inactive") dormantSellers += 1;
    if (tier === "activating") activatingSellers += 1;
    if (business.bankAccountNumber) storesWithBank += 1;
    if (business._count.products > 0) storesWithProducts += 1;
    if (business._count.orders > 0) storesWithSales += 1;

    const periodStats = gmvMap.get(business.id);

    sellerHealth.push({
      id: business.id,
      name: business.name,
      slug: business.slug,
      plan: business.plan,
      isActive: business.isActive,
      ownerName: business.owner.name,
      ownerEmail: business.owner.email,
      tier,
      productCount: business._count.products,
      orderCount: business._count.orders,
      customerCount: business._count.customers,
      periodGmv: periodStats?.gmv ?? 0,
      periodOrders: periodStats?.orders ?? 0,
      hasBank: Boolean(business.bankAccountNumber),
      lastOrderAt: lastOrderAt?.toISOString() ?? null,
      createdAt: business.createdAt.toISOString(),
    });
  }

  sellerHealth.sort((a, b) => b.periodGmv - a.periodGmv);

  const activationRate = businesses.length > 0 ? storesWithSales / businesses.length : 0;
  const bankCompletionRate = businesses.length > 0 ? storesWithBank / businesses.length : 0;
  const catalogRate = businesses.length > 0 ? storesWithProducts / businesses.length : 0;

  const gmvChange = prevGmv > 0 ? ((gmv - prevGmv) / prevGmv) * 100 : null;
  const ordersChange =
    prevFulfilledCount > 0
      ? ((fulfilledCount - prevFulfilledCount) / prevFulfilledCount) * 100
      : null;

  return {
    periodDays,
    pulse: {
      gmv,
      gmvChange,
      fulfilledOrders: fulfilledCount,
      ordersChange,
      avgOrderValue: fulfilledCount > 0 ? gmv / fulfilledCount : 0,
      activeSellers,
      totalStores: businesses.length,
      dormantSellers,
      activatingSellers,
      pendingReceiptBacklog: pendingWithReceipt,
      repeatCustomerRate,
      repeatCustomers: repeatCustomers.length,
      customersWithOrders: customersWithOrders.length,
      totalCustomers,
      newCustomers,
      activationRate,
      bankCompletionRate,
      catalogRate,
    },
    daily,
    planBreakdown: planGroups.map((row) => ({
      plan: row.plan,
      count: row._count._all,
    })),
    statusBreakdown: statusGroups.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    tierCounts,
    sellerHealth,
  };
}

export async function getPlatformCustomerInsights(periodDays: PeriodDays = 30) {
  const since = periodStart(periodDays);

  const [customers, topSpenders, promoOrders] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        createdAt: true,
        business: { select: { id: true, name: true, slug: true, currency: true } },
        _count: { select: { orders: true } },
        orders: {
          where: { status: { in: [...FULFILLED_STATUSES] } },
          select: { total: true, createdAt: true, promotionCode: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: { not: null },
        status: { in: [...FULFILLED_STATUSES] },
        createdAt: { gte: since },
      },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 25,
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: since },
        promotionCode: { not: null },
        status: { in: [...FULFILLED_STATUSES] },
      },
    }),
  ]);

  const topSpenderIds = topSpenders
    .map((row) => row.customerId)
    .filter((id): id is string => Boolean(id));

  const topSpenderCustomers =
    topSpenderIds.length > 0
      ? await prisma.customer.findMany({
          where: { id: { in: topSpenderIds } },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            createdAt: true,
            business: { select: { id: true, name: true, slug: true, currency: true } },
            _count: { select: { orders: true } },
            orders: {
              where: { status: { in: [...FULFILLED_STATUSES] } },
              select: { total: true, createdAt: true },
              orderBy: { createdAt: "desc" },
            },
          },
        })
      : [];

  const customerMap = new Map(topSpenderCustomers.map((c) => [c.id, c]));

  const topCustomers = topSpenders
    .filter((row) => row.customerId)
    .map((row) => {
      const customer = customerMap.get(row.customerId!);
      if (!customer) return null;
      const ltv = customer.orders.reduce((sum, o) => sum + toNumber(o.total), 0);
      const periodSpend = toNumber(row._sum.total);
      const lastOrder = customer.orders[0]?.createdAt;
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        hasAddress: Boolean(customer.address),
        orderCount: customer._count.orders,
        periodOrders: row._count._all,
        periodSpend,
        lifetimeValue: ltv,
        isRepeat: customer._count.orders >= 2,
        lastOrderAt: lastOrder?.toISOString() ?? null,
        createdAt: customer.createdAt.toISOString(),
        store: customer.business,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const withEmail = customers.filter((c) => c.email).length;
  const withAddress = customers.filter((c) => c.address).length;
  const repeatInSample = customers.filter((c) => c._count.orders >= 2).length;
  const withOrdersInSample = customers.filter((c) => c._count.orders > 0).length;
  const newInPeriod = customers.filter((c) => c.createdAt >= since).length;

  const fulfilledInPeriod = await prisma.order.count({
    where: { createdAt: { gte: since }, status: { in: [...FULFILLED_STATUSES] } },
  });

  const promoRate = fulfilledInPeriod > 0 ? promoOrders / fulfilledInPeriod : 0;

  return {
    periodDays,
    summary: {
      sampledCustomers: customers.length,
      withEmail,
      withAddress,
      emailCoverage: customers.length > 0 ? withEmail / customers.length : 0,
      addressCoverage: customers.length > 0 ? withAddress / customers.length : 0,
      repeatRateInSample:
        withOrdersInSample > 0 ? repeatInSample / withOrdersInSample : 0,
      newCustomersInSample: newInPeriod,
      promoOrderRate: promoRate,
      promoOrders,
      fulfilledOrdersInPeriod: fulfilledInPeriod,
    },
    topCustomers,
    recentCustomers: customers.slice(0, 50).map((c) => {
      const ltv = c.orders.reduce((sum, o) => sum + toNumber(o.total), 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        orderCount: c._count.orders,
        lifetimeValue: ltv,
        isRepeat: c._count.orders >= 2,
        createdAt: c.createdAt.toISOString(),
        store: c.business,
      };
    }),
  };
}