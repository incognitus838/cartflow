import { NextResponse } from "next/server";
import type { BusinessPlan } from "@prisma/client";
import { requireApiStoreOwner } from "@/lib/api/require-business";
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

export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Plan changes are managed by CartFlow. Contact support or ask your platform admin to update your subscription.",
    },
    { status: 403 },
  );
}