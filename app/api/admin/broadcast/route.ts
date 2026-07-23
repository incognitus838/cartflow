import { NextResponse } from "next/server";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { listSellerRecipients, sendSellerBroadcast } from "@/lib/admin/broadcast";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_PLANS = Object.keys(PLANS) as BusinessPlan[];
const VALID_APPROVAL: StoreApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function parseBody(data: Record<string, unknown>) {
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const body = typeof data.body === "string" ? data.body.trim() : "";
  const audienceRaw = typeof data.audience === "string" ? data.audience : "all_owners";
  const audience: "all_owners" | "plan" | "approval" =
    audienceRaw === "plan" || audienceRaw === "approval" ? audienceRaw : "all_owners";
  const plan =
    typeof data.plan === "string" && VALID_PLANS.includes(data.plan as BusinessPlan)
      ? (data.plan as BusinessPlan)
      : undefined;
  const approvalStatus =
    typeof data.approvalStatus === "string" &&
    VALID_APPROVAL.includes(data.approvalStatus as StoreApprovalStatus)
      ? (data.approvalStatus as StoreApprovalStatus)
      : undefined;
  const ctaLabel = typeof data.ctaLabel === "string" ? data.ctaLabel.trim() : undefined;
  const ctaHref = typeof data.ctaHref === "string" ? data.ctaHref.trim() : undefined;

  return {
    subject,
    body,
    audience,
    plan,
    approvalStatus,
    ctaLabel,
    ctaHref,
  };
}

/** Preview audience size without sending. */
export async function GET(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const audienceRaw = url.searchParams.get("audience") || "all_owners";
  const audience =
    audienceRaw === "plan" || audienceRaw === "approval" ? audienceRaw : "all_owners";
  const planParam = url.searchParams.get("plan") || "";
  const approvalParam = url.searchParams.get("approvalStatus") || "";

  const plan =
    planParam && VALID_PLANS.includes(planParam as BusinessPlan)
      ? (planParam as BusinessPlan)
      : undefined;
  const approvalStatus =
    approvalParam && VALID_APPROVAL.includes(approvalParam as StoreApprovalStatus)
      ? (approvalParam as StoreApprovalStatus)
      : undefined;

  const recipients = await listSellerRecipients({
    subject: "preview",
    body: "preview body long enough",
    audience,
    plan,
    approvalStatus,
  });

  return NextResponse.json({
    count: recipients.length,
    sample: recipients.slice(0, 5).map((r) => ({
      email: r.email,
      name: r.name,
      storeName: r.storeName,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const input = parseBody(raw as Record<string, unknown>);

  if (input.audience === "plan" && !input.plan) {
    return NextResponse.json({ error: "Select a plan for this audience." }, { status: 400 });
  }
  if (input.audience === "approval" && !input.approvalStatus) {
    return NextResponse.json(
      { error: "Select an approval status for this audience." },
      { status: 400 },
    );
  }

  try {
    const result = await sendSellerBroadcast(input);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Broadcast failed." },
      { status: 400 },
    );
  }
}
