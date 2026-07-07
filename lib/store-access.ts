import "server-only";

import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { permissionsForMember, permissionsForOwner } from "@/lib/team/permissions";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import type { StoreAccessRole } from "@/lib/store-access-types";

export type { StoreAccessRole } from "@/lib/store-access-types";

export type StoreAccessContext = {
  role: StoreAccessRole;
  permissions: MemberPermissions;
  accessPreset: string | null;
  memberId: string | null;
};

export async function getStoreAccessContext(
  userId: string,
  businessId: string,
): Promise<StoreAccessContext | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  });

  if (!business) return null;

  if (business.ownerId === userId) {
    return {
      role: "owner",
      permissions: permissionsForOwner(),
      accessPreset: null,
      memberId: null,
    };
  }

  const membership = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId } },
  });

  if (!membership || membership.isSuspended) return null;

  return {
    role: membership.role === "OWNER" ? "owner" : "staff",
    permissions: permissionsForMember(membership),
    accessPreset: membership.accessPreset,
    memberId: membership.id,
  };
}

export async function getStoreAccessRole(
  userId: string,
  businessId: string,
): Promise<StoreAccessRole | null> {
  const ctx = await getStoreAccessContext(userId, businessId);
  return ctx?.role ?? null;
}

export async function resolveStoreAccessContext(
  session: SessionPayload,
  userId: string,
  businessId: string,
): Promise<StoreAccessContext | null> {
  if (session.impersonatorId) {
    return {
      role: "owner",
      permissions: permissionsForOwner(),
      accessPreset: null,
      memberId: null,
    };
  }
  return getStoreAccessContext(userId, businessId);
}

export async function resolveStoreAccessRole(
  session: SessionPayload,
  userId: string,
  businessId: string,
): Promise<StoreAccessRole | null> {
  const ctx = await resolveStoreAccessContext(session, userId, businessId);
  return ctx?.role ?? null;
}

export function isStoreOwnerRole(role: StoreAccessRole | null): role is "owner" {
  return role === "owner";
}