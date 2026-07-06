import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getBusinessForUser(userId: string, businessId: string) {
  return prisma.business.findFirst({
    where: {
      id: businessId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });
}

export async function assertBusinessAccess(userId: string, businessId: string) {
  const business = await getBusinessForUser(userId, businessId);
  if (!business) {
    throw new Error("FORBIDDEN");
  }
  return business;
}

export async function resolveActiveBusinessId(session: SessionPayload) {
  if (session.businessId) {
    const match = await getBusinessForUser(session.userId, session.businessId);
    if (match) return match.id;
  }

  const owned = await prisma.business.findFirst({
    where: { ownerId: session.userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (owned) return owned.id;

  const membership = await prisma.businessMember.findFirst({
    where: { userId: session.userId },
    select: { businessId: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.businessId ?? null;
}

export function businessScope(businessId: string) {
  return { businessId } as const;
}

export function scopedProductWhere(businessId: string, productId: string) {
  return { id: productId, businessId };
}

export function scopedOrderWhere(businessId: string, orderId: string) {
  return { id: orderId, businessId };
}