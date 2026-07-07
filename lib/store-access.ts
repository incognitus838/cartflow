import "server-only";

import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StoreAccessRole } from "@/lib/store-access-types";

export type { StoreAccessRole } from "@/lib/store-access-types";

export async function getStoreAccessRole(
  userId: string,
  businessId: string,
): Promise<StoreAccessRole | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  });

  if (!business) return null;
  if (business.ownerId === userId) return "owner";

  const membership = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId } },
    select: { role: true },
  });

  if (!membership) return null;
  return membership.role === "OWNER" ? "owner" : "staff";
}

export async function resolveStoreAccessRole(
  session: SessionPayload,
  userId: string,
  businessId: string,
): Promise<StoreAccessRole | null> {
  if (session.impersonatorId) return "owner";
  return getStoreAccessRole(userId, businessId);
}

export function isStoreOwnerRole(role: StoreAccessRole | null): role is "owner" {
  return role === "owner";
}