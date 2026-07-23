import { NextResponse } from "next/server";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { sendSellerBroadcast } from "@/lib/admin/broadcast";
import { listSellerRecipients } from "@/lib/admin/broadcast-recipients";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_PLANS = Object.keys(PLANS) as BusinessPlan[];
const VALID_APPROVAL: StoreApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function parseAudience(data: Record<string, unknown>) {
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
  return { audience, plan, approvalStatus };
}

/** null = field omitted; string[] = explicit list (may be empty → send nobody). */
function parseStringList(value: unknown): string[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return null;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBody(data: Record<string, unknown>) {
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const body = typeof data.body === "string" ? data.body.trim() : "";
  const { audience, plan, approvalStatus } = parseAudience(data);
  const ctaLabel = typeof data.ctaLabel === "string" ? data.ctaLabel.trim() : undefined;
  const ctaHref = typeof data.ctaHref === "string" ? data.ctaHref.trim() : undefined;
  // Prefer includeEmails when the key is present (UI always sends the curated list).
  const hasInclude = Object.prototype.hasOwnProperty.call(data, "includeEmails");
  const hasExclude = Object.prototype.hasOwnProperty.call(data, "excludeEmails");
  const includeEmails = hasInclude ? (parseStringList(data.includeEmails) ?? []) : undefined;
  const excludeEmails = hasExclude ? (parseStringList(data.excludeEmails) ?? []) : undefined;

  return {
    subject,
    body,
    audience,
    plan,
    approvalStatus,
    ctaLabel,
    ctaHref,
    includeEmails,
    excludeEmails,
  };
}

/** Full audience list for the compose UI. */
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
    audience,
    plan,
    approvalStatus,
  });

  return NextResponse.json({
    count: recipients.length,
    recipients: recipients.map((r) => ({
      email: r.email,
      name: r.name,
      storeName: r.storeName,
      businessId: r.businessId,
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
