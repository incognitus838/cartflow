import { NextResponse } from "next/server";
import { updateSessionBusiness } from "@/lib/auth";
import { requireApiBusiness } from "@/lib/api/require-business";
import { assertBusinessAccess } from "@/lib/tenant";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const businessId = typeof body?.businessId === "string" ? body.businessId.trim() : "";

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  if (businessId === auth.business.id) {
    return NextResponse.json({ ok: true, businessId });
  }

  try {
    await assertBusinessAccess(auth.session.userId, businessId, auth.session);
    const updated = await updateSessionBusiness(businessId);
    if (!updated) {
      return NextResponse.json({ error: "Could not switch store." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, businessId });
  } catch {
    return NextResponse.json({ error: "You do not have access to that store." }, { status: 403 });
  }
}