import "server-only";

import type { BusinessPlan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { planStoreLimit } from "@/lib/plans";
import type { AccessibleStore, OwnedStoreDetail } from "@/lib/team/store-types";

export type { AccessibleStore, OwnedStoreDetail } from "@/lib/team/store-types";

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  approvalStatus: true,
  isActive: true,
} as const;

export async function listAccessibleStores(userId: string): Promise<AccessibleStore[]> {
  const [owned, memberships] = await Promise.all([
    prisma.business.findMany({
      where: { ownerId: userId },
      select: storeSelect,
      orderBy: { createdAt: "asc" },
    }),
    prisma.businessMember.findMany({
      where: { userId, isSuspended: false, role: "STAFF" },
      include: {
        business: { select: storeSelect },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const stores: AccessibleStore[] = owned.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    access: "owner" as const,
    accessPreset: null,
    approvalStatus: b.approvalStatus,
    isActive: b.isActive,
  }));

  for (const membership of memberships) {
    if (!stores.some((s) => s.id === membership.business.id)) {
      stores.push({
        id: membership.business.id,
        name: membership.business.name,
        slug: membership.business.slug,
        access: "staff",
        accessPreset: membership.accessPreset,
        approvalStatus: membership.business.approvalStatus,
        isActive: membership.business.isActive,
      });
    }
  }

  return stores;
}

export async function listOwnedStores(userId: string): Promise<OwnedStoreDetail[]> {
  const businesses = await prisma.business.findMany({
    where: { ownerId: userId },
    select: {
      ...storeSelect,
      createdAt: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return businesses.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    approvalStatus: b.approvalStatus,
    isActive: b.isActive,
    createdAt: b.createdAt,
    productCount: b._count.products,
  }));
}

export async function countOwnedStores(userId: string) {
  return prisma.business.count({ where: { ownerId: userId } });
}

function ownerStoreCap(plans: BusinessPlan[]): number | null {
  if (plans.some((plan) => planStoreLimit(plan) === null)) return null;
  return 1;
}

/** Owners may create multiple stores on Enterprise; staff-only accounts may not. */
export async function canUserCreateStore(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const [owned, staffMembership] = await Promise.all([
    prisma.business.findMany({
      where: { ownerId: userId },
      select: { plan: true },
    }),
    prisma.businessMember.findFirst({
      where: { userId, role: "STAFF" },
      select: { id: true },
    }),
  ]);

  if (owned.length === 0 && staffMembership) {
    return {
      allowed: false,
      reason: "Team members cannot create stores. Ask your store owner for access.",
    };
  }

  const cap = ownerStoreCap(owned.map((store) => store.plan));
  if (cap !== null && owned.length >= cap) {
    return {
      allowed: false,
      reason: "Upgrade to Enterprise for 2+ stores.",
    };
  }

  return { allowed: true };
}