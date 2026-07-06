import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const adminOrderInclude = {
  business: {
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  },
  customer: { select: { email: true } },
  items: { orderBy: { id: "asc" as const } },
  notifications: { orderBy: { createdAt: "desc" as const }, take: 10 },
};

export type AdminOrderDetail = Prisma.OrderGetPayload<{
  include: typeof adminOrderInclude;
}>;

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderInclude,
  });
}