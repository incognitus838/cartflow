import "server-only";

import { prisma } from "@/lib/db";
import { logStoreActivity } from "@/lib/team/activity";

const adminStoreSelect = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  isActive: true,
  isSuspended: true,
  suspendedAt: true,
  suspendReason: true,
  deletedAt: true,
  deletedById: true,
  deleteReason: true,
  approvalStatus: true,
  submittedAt: true,
  createdAt: true,
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { products: true, orders: true } },
} as const;

export type AdminStoreLifecycleRow = Awaited<
  ReturnType<typeof listActiveAdminStores>
>[number];

export async function listActiveAdminStores(options?: { search?: string; take?: number }) {
  const search = options?.search?.trim();
  const take = options?.take ?? 200;

  return prisma.business.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { slug: { contains: search, mode: "insensitive" as const } },
              { owner: { email: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: adminStoreSelect,
  });
}

export async function listDeletedAdminStores(options?: { take?: number }) {
  const take = options?.take ?? 200;

  return prisma.business.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    take,
    select: adminStoreSelect,
  });
}

export async function countDeletedStores() {
  return prisma.business.count({ where: { deletedAt: { not: null } } });
}

export async function getBusinessForAdminAction(businessId: string) {
  return prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isSuspended: true,
      deletedAt: true,
      approvalStatus: true,
    },
  });
}

export async function suspendBusiness(
  businessId: string,
  options: { adminUserId: string; adminName: string; reason?: string },
) {
  const existing = await getBusinessForAdminAction(businessId);
  if (!existing) throw new Error("Store not found.");
  if (existing.deletedAt) throw new Error("Restore this store from the recycle bin first.");
  if (existing.isSuspended) throw new Error("Store is already suspended.");

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      isSuspended: true,
      suspendedAt: new Date(),
      suspendReason: options.reason?.trim() || null,
      isActive: false,
    },
    select: adminStoreSelect,
  });

  await logStoreActivity({
    businessId,
    action: "ORDER_UPDATED",
    actorUserId: options.adminUserId,
    actorName: options.adminName,
    detail: `Store suspended by platform admin${options.reason ? `: ${options.reason.trim()}` : ""}`,
    metadata: { lifecycle: "suspend", reason: options.reason?.trim() || null },
  });

  return business;
}

export async function unsuspendBusiness(
  businessId: string,
  options: { adminUserId: string; adminName: string },
) {
  const existing = await getBusinessForAdminAction(businessId);
  if (!existing) throw new Error("Store not found.");
  if (existing.deletedAt) throw new Error("Restore this store from the recycle bin first.");
  if (!existing.isSuspended) throw new Error("Store is not suspended.");

  const shouldActivate = existing.approvalStatus === "APPROVED";

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      isSuspended: false,
      suspendedAt: null,
      suspendReason: null,
      isActive: shouldActivate,
    },
    select: adminStoreSelect,
  });

  await logStoreActivity({
    businessId,
    action: "ORDER_UPDATED",
    actorUserId: options.adminUserId,
    actorName: options.adminName,
    detail: "Store unsuspended by platform admin",
    metadata: { lifecycle: "unsuspend" },
  });

  return business;
}

export async function softDeleteBusiness(
  businessId: string,
  options: { adminUserId: string; adminName: string; reason?: string },
) {
  const existing = await getBusinessForAdminAction(businessId);
  if (!existing) throw new Error("Store not found.");
  if (existing.deletedAt) throw new Error("Store is already in the recycle bin.");

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      deletedAt: new Date(),
      deletedById: options.adminUserId,
      deleteReason: options.reason?.trim() || null,
      isActive: false,
      isSuspended: true,
      suspendedAt: new Date(),
      suspendReason: options.reason?.trim() || "Moved to recycle bin",
    },
    select: adminStoreSelect,
  });

  await logStoreActivity({
    businessId,
    action: "ORDER_UPDATED",
    actorUserId: options.adminUserId,
    actorName: options.adminName,
    detail: `Store moved to recycle bin${options.reason ? `: ${options.reason.trim()}` : ""}`,
    metadata: { lifecycle: "soft_delete", reason: options.reason?.trim() || null },
  });

  return business;
}

export async function restoreBusiness(
  businessId: string,
  options: { adminUserId: string; adminName: string },
) {
  const existing = await getBusinessForAdminAction(businessId);
  if (!existing) throw new Error("Store not found.");
  if (!existing.deletedAt) throw new Error("Store is not in the recycle bin.");

  const shouldActivate = existing.approvalStatus === "APPROVED";

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      deletedAt: null,
      deletedById: null,
      deleteReason: null,
      isSuspended: false,
      suspendedAt: null,
      suspendReason: null,
      isActive: shouldActivate,
    },
    select: adminStoreSelect,
  });

  await logStoreActivity({
    businessId,
    action: "ORDER_UPDATED",
    actorUserId: options.adminUserId,
    actorName: options.adminName,
    detail: "Store restored from recycle bin by platform admin",
    metadata: { lifecycle: "restore" },
  });

  return business;
}

/**
 * Permanently delete a store and cascade-related data.
 * Only allowed for stores already in the recycle bin.
 */
export async function permanentlyDeleteBusiness(businessId: string) {
  const existing = await getBusinessForAdminAction(businessId);
  if (!existing) throw new Error("Store not found.");
  if (!existing.deletedAt) {
    throw new Error("Move the store to the recycle bin before permanent delete.");
  }

  // Clear optional FKs that block cascade (gift product, customer on orders handled via cascade)
  await prisma.promotion.updateMany({
    where: { businessId },
    data: { giftProductId: null },
  });

  await prisma.business.delete({ where: { id: businessId } });
  return { id: businessId, slug: existing.slug, name: existing.name };
}
