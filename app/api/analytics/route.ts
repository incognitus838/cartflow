import { NextResponse } from "next/server";
import { requireApiBusiness } from "@/lib/api/require-business";
import { getBusinessAnalytics } from "@/lib/analytics/business";
import { hasAnalytics } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  if (!hasAnalytics(auth.business.plan)) {
    return NextResponse.json(
      { error: "Analytics requires a Starter plan or higher." },
      { status: 403 },
    );
  }

  const analytics = await getBusinessAnalytics(auth.business.id);
  return NextResponse.json({ analytics });
}