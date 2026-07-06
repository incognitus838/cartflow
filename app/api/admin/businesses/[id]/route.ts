import { NextResponse } from "next/server";
import type { BusinessPlan } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { setBusinessActive, setBusinessPlan } from "@/lib/admin/queries";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_PLANS = Object.keys(PLANS) as BusinessPlan[];

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (typeof body?.isActive === "boolean") {
    const business = await setBusinessActive(id, body.isActive);
    return NextResponse.json({
      business: { id: business.id, isActive: business.isActive, plan: business.plan },
    });
  }

  if (typeof body?.plan === "string" && VALID_PLANS.includes(body.plan as BusinessPlan)) {
    const business = await setBusinessPlan(id, body.plan);
    return NextResponse.json({
      business: { id: business.id, isActive: business.isActive, plan: business.plan },
    });
  }

  return NextResponse.json(
    { error: "Provide isActive (boolean) or plan (FREE|STARTER|PRO|ENTERPRISE)." },
    { status: 400 },
  );
}