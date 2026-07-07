import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveStoreAccessRole } from "@/lib/store-access";
import type { StoreAccessRole } from "@/lib/store-access-types";
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
    const storeAccessRole = await resolveStoreAccessRole(session, session.userId, businessId);
    if (!storeAccessRole) {
      return { error: NextResponse.json({ error: "Access denied." }, { status: 403 }) };
    }
    return { session, business, storeAccessRole };
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

  return auth as typeof auth & { storeAccessRole: "owner" };
}

export type ApiBusinessAuth = {
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  business: Awaited<ReturnType<typeof assertBusinessAccess>>;
  storeAccessRole: StoreAccessRole;
};