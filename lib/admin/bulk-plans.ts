import "server-only";

import type { BusinessPlan, Prisma, StoreApprovalStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const VALID_BULK_PLANS = Object.keys(PLANS) as BusinessPlan[];

export type BulkPlanFilters = {
  search?: string;
  approval?: StoreApprovalStatus | "";
  plan?: BusinessPlan | "";
  live?: "" | "active" | "inactive" | "public" | "suspended";
};

function buildWhere(filters?: BulkPlanFilters): Prisma.BusinessWhereInput {
  const search = filters?.search?.trim();
  const where: Prisma.BusinessWhereInput = {
    deletedAt: null,
  };

  if (filters?.approval) {
    where.approvalStatus = filters.approval;
  }
  if (filters?.plan) {
    where.plan = filters.plan;
  }
  if (filters?.live === "active") {
    where.isActive = true;
    where.isSuspended = false;
  } else if (filters?.live === "inactive") {
    where.isActive = false;
    where.isSuspended = false;
  } else if (filters?.live === "public") {
    where.isActive = true;
    where.isSuspended = false;
    where.approvalStatus = "APPROVED";
  } else if (filters?.live === "suspended") {
    where.isSuspended = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { owner: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function bulkSetBusinessPlans(input: {
  plan: BusinessPlan;
  mode: "ids" | "filters";
  ids?: string[];
  filters?: BulkPlanFilters;
}) {
  if (!VALID_BULK_PLANS.includes(input.plan)) {
    throw new Error("Invalid plan.");
  }

  let where: Prisma.BusinessWhereInput;

  if (input.mode === "ids") {
    const ids = Array.from(new Set((input.ids ?? []).filter(Boolean)));
    if (ids.length === 0) throw new Error("Select at least one store.");
    if (ids.length > 5000) throw new Error("Maximum 5,000 stores per bulk update.");
    where = { deletedAt: null, id: { in: ids } };
  } else {
    where = buildWhere(input.filters);
  }

  const matched = await prisma.business.count({ where });
  if (matched === 0) {
    return { updated: 0, plan: input.plan };
  }
  if (matched > 5000) {
    throw new Error(`This would update ${matched} stores. Maximum is 5,000. Narrow your filters.`);
  }

  const result = await prisma.business.updateMany({
    where,
    data: {
      plan: input.plan,
      planStartedAt: new Date(),
    },
  });

  return { updated: result.count, plan: input.plan };
}

export async function countBusinessesForFilters(filters?: BulkPlanFilters) {
  return prisma.business.count({ where: buildWhere(filters) });
}
