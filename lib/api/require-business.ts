import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveStoreAccessContext } from "@/lib/store-access";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { assertBusinessAccess, resolveActiveBusinessId } from "@/lib/tenant";

export async function requireApiBusiness() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  const businessId = await resolveActiveBusinessId(session);
  if (!businessId) {
    return { error: NextResponse.json({ error: "No store found." }, { status: 404 }) };
  }

  try {
    const business = await assertBusinessAccess(session.userId, businessId, session);
    const access = await resolveStoreAccessContext(session, session.userId, businessId);
    if (!access) {
      return { error: NextResponse.json({ error: "Access denied." }, { status: 403 }) };
    }
    return {
      session,
      business,
      storeAccessRole: access.role,
      permissions: access.permissions,
      accessPreset: access.accessPreset,
    };
  } catch {
    return { error: NextResponse.json({ error: "Access denied." }, { status: 403 }) };
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