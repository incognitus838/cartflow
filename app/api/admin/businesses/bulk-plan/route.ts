import { NextResponse } from "next/server";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { bulkSetBusinessPlans, VALID_BULK_PLANS } from "@/lib/admin/bulk-plans";
import { requireApiAdmin } from "@/lib/api/require-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_APPROVAL: StoreApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const VALID_LIVE = ["", "active", "inactive", "public", "suspended"] as const;

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const plan = typeof data.plan === "string" ? (data.plan as BusinessPlan) : null;
  const mode = data.mode === "filters" ? "filters" : "ids";

  if (!plan || !VALID_BULK_PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "plan must be FREE, STARTER, PRO, or ENTERPRISE." },
      { status: 400 },
    );
  }

  const ids = Array.isArray(data.ids)
    ? data.ids.filter((id): id is string => typeof id === "string")
    : [];

  const rawFilters =
    data.filters && typeof data.filters === "object"
      ? (data.filters as Record<string, unknown>)
      : {};

  const approval =
    typeof rawFilters.approval === "string" &&
    VALID_APPROVAL.includes(rawFilters.approval as StoreApprovalStatus)
      ? (rawFilters.approval as StoreApprovalStatus)
      : "";
  const filterPlan =
    typeof rawFilters.plan === "string" &&
    VALID_BULK_PLANS.includes(rawFilters.plan as BusinessPlan)
      ? (rawFilters.plan as BusinessPlan)
      : "";
  const live =
    typeof rawFilters.live === "string" &&
    (VALID_LIVE as readonly string[]).includes(rawFilters.live)
      ? (rawFilters.live as (typeof VALID_LIVE)[number])
      : "";
  const search = typeof rawFilters.search === "string" ? rawFilters.search : "";

  try {
    const result = await bulkSetBusinessPlans({
      plan,
      mode,
      ids,
      filters: { approval, plan: filterPlan, live, search },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk update failed." },
      { status: 400 },
    );
  }
}
