import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";

export function isImpersonationSession(session: SessionPayload) {
  return Boolean(session.impersonatorId);
}

export async function getBusinessById(businessId: string) {
  return prisma.business.findUnique({ where: { id: businessId } });
}

export async function getBusinessForUser(userId: string, businessId: string) {
  return prisma.business.findFirst({
    where: {
      id: businessId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });
}

export async function resolveBusinessForSession(session: SessionPayload) {
  if (isImpersonationSession(session) && session.businessId) {
    return getBusinessById(session.businessId);
  }

  if (session.businessId) {
    const match = await getBusinessForUser(session.userId, session.businessId);
    if (match) return match;
  }

  const owned = await prisma.business.findFirst({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  if (owned) return owned;

  const membership = await prisma.businessMember.findFirst({
    where: { userId: session.userId },
    include: { business: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.business ?? null;
}

export async function assertBusinessAccess(
  userId: string,
  businessId: string,
  session?: SessionPayload | null,
) {
  if (session?.impersonatorId && session.businessId === businessId) {
    const business = await getBusinessById(businessId);
    if (business) return business;
    throw new Error("FORBIDDEN");
  }

  const business = await getBusinessForUser(userId, businessId);
  if (!business) {
    throw new Error("FORBIDDEN");
  }
  return business;
}

export async function resolveActiveBusinessId(session: SessionPayload) {
  if (isImpersonationSession(session) && session.businessId) {
    const business = await getBusinessById(session.businessId);
    return business?.id ?? null;
  }

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