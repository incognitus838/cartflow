import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LIVE_STORE_LOCKED_UNTIL_APPROVAL, PRODUCTS_LOCKED_UNTIL_APPROVAL } from "@/lib/business/approval";
import { resolveStoreAccessContext } from "@/lib/store-access";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { assertBusinessAccess, resolveActiveBusinessId } from "@/lib/tenant";

export async function requireApiBusiness() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isSuspended: true },
  });
  if (!user || user.isSuspended) {
    await clearSession();
    return {
      error: NextResponse.json(
        { error: "Your account has been suspended.", reason: "suspended" },
        { status: 401 },
      ),
    };
  }

  const businessId = await resolveActiveBusinessId(session);
  if (!businessId) {
    await clearSession();
    return {
      error: NextResponse.json(
        { error: "Your store access was removed.", reason: "access_revoked" },
        { status: 401 },
      ),
    };
  }

  try {
    const business = await assertBusinessAccess(session.userId, businessId, session);
    const access = await resolveStoreAccessContext(session, session.userId, businessId);
    if (!access) {
      await clearSession();
      return {
        error: NextResponse.json(
          { error: "Your store access was removed.", reason: "access_revoked" },
          { status: 401 },
        ),
      };
    }
    return {
      session,
      business,
      storeAccessRole: access.role,
      permissions: access.permissions,
      accessPreset: access.accessPreset,
    };
  } catch {
    await clearSession();
    return {
      error: NextResponse.json(
        { error: "Your store access was removed.", reason: "access_revoked" },
        { status: 401 },
      ),
    };
  }
}

export async function requireApiStoreOwner() {
  const auth = await requireApiBusiness();
  if (auth.error) return auth;
  if (auth.storeAccessRole !== "owner") {
    return {
      error: NextResponse.json({ error: "Store owner access required." }, { status: 403 }),
    };
  }
  return auth;
}

export async function requireApiPermission(permission: keyof MemberPermissions) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth;
  if (!auth.permissions[permission]) {
    return {
      error: NextResponse.json({ error: "You do not have permission for this action." }, { status: 403 }),
    };
  }
  return auth;
}

export async function requireApprovedStore() {
  const auth = await requireApiBusiness();
  if (auth.error) return auth;
  if (auth.business.approvalStatus !== "APPROVED") {
    return {
      error: NextResponse.json(
        { error: PRODUCTS_LOCKED_UNTIL_APPROVAL, code: "STORE_NOT_APPROVED" },
        { status: 403 },
      ),
    };
  }
  return auth;
}

export async function requireLiveStore() {
  const auth = await requireApiBusiness();
  if (auth.error) return auth;
  if (auth.business.approvalStatus !== "APPROVED") {
    return {
      error: NextResponse.json(
        { error: LIVE_STORE_LOCKED_UNTIL_APPROVAL, code: "STORE_NOT_LIVE" },
        { status: 403 },
      ),
    };
  }
  return auth;
}