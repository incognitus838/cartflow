import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
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
    const business = await assertBusinessAccess(session.userId, businessId);
    return { session, business };
  } catch {
    return { error: NextResponse.json({ error: "Access denied." }, { status: 403 }) };
  }
}