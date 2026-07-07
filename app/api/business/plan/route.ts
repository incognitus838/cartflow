import { NextResponse } from "next/server";
import type { BusinessPlan } from "@prisma/client";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

const VALID_PLANS = Object.keys(PLANS) as BusinessPlan[];

export async function GET() {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  return NextResponse.json({
    plan: auth.business.plan,
    plans: VALID_PLANS.map((id) => PLANS[id]),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const plan = typeof body?.plan === "string" ? body.plan : "";

  if (!VALID_PLANS.includes(plan as BusinessPlan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const business = await prisma.business.update({
    where: { id: auth.business.id },
    data: { plan: plan as BusinessPlan },
  });

  return NextResponse.json({ plan: business.plan });
}