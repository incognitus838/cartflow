import "server-only";

import type { Prisma, StoreActivityAction } from "@prisma/client";
import { prisma } from "@/lib/db";

type LogActivityInput = {
  businessId: string;
  action: StoreActivityAction;
  actorUserId?: string;
  actorName?: string;
  detail?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logStoreActivity(input: LogActivityInput) {
  return prisma.storeActivityLog.create({
    data: {
      businessId: input.businessId,
      action: input.action,
      actorUserId: input.actorUserId,
      actorName: input.actorName,
      detail: input.detail,
      metadata: input.metadata,
    },
  });
}

export async function listStoreActivity(businessId: string, take = 30) {
  return prisma.storeActivityLog.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take,
  });
}