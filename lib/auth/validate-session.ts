import "server-only";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveStoreAccessContext } from "@/lib/store-access";
import { listAccessibleStores } from "@/lib/team/stores";
import { resolveActiveBusinessId } from "@/lib/tenant";

export type SessionInvalidReason =
  | "unauthenticated"
  | "suspended"
  | "access_revoked"
  | "user_not_found";

export type SessionValidationResult =
  | { ok: true; userId: string; businessId: string }
  | { ok: false; reason: SessionInvalidReason };

export async function validateActiveSession(): Promise<SessionValidationResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, reason: "unauthenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isSuspended: true, role: true },
  });

  if (!user) {
    return { ok: false, reason: "user_not_found" };
  }

  if (user.isSuspended) {
    return { ok: false, reason: "suspended" };
  }

  if (user.role === "ADMIN" || session.impersonatorId) {
    return { ok: true, userId: user.id, businessId: session.businessId ?? "" };
  }

  const accessible = await listAccessibleStores(user.id);
  if (accessible.length === 0) {
    return { ok: false, reason: "access_revoked" };
  }

  const businessId = await resolveActiveBusinessId(session);
  if (!businessId) {
    return { ok: false, reason: "access_revoked" };
  }

  const access = await resolveStoreAccessContext(session, user.id, businessId);
  if (!access) {
    return { ok: false, reason: "access_revoked" };
  }

  return { ok: true, userId: user.id, businessId };
}