import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { BusinessPlan } from "@prisma/client";
import { reviewStoreApplication } from "@/lib/admin/store-approval";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { VALID_APPROVAL_PLANS } from "@/lib/business/approval";
import { sendStoreApprovedEmail, sendStoreRejectedEmail } from "@/lib/email/transactional";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const action = data.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject." }, { status: 400 });
  }

  const plan =
    typeof data.plan === "string" && VALID_APPROVAL_PLANS.includes(data.plan as BusinessPlan)
      ? (data.plan as BusinessPlan)
      : undefined;

  try {
    const business = await reviewStoreApplication(id, {
      action,
      adminUserId: auth.session.userId,
      rejectionReason:
        typeof data.rejectionReason === "string" ? data.rejectionReason : undefined,
      approvalNotes: typeof data.approvalNotes === "string" ? data.approvalNotes : undefined,
      resubmissionAllowed:
        typeof data.resubmissionAllowed === "boolean" ? data.resubmissionAllowed : undefined,
      bankVerified: typeof data.bankVerified === "boolean" ? data.bankVerified : undefined,
      catalogVerified:
        typeof data.catalogVerified === "boolean" ? data.catalogVerified : undefined,
      contactVerified:
        typeof data.contactVerified === "boolean" ? data.contactVerified : undefined,
      plan,
      approvalPriority:
        data.approvalPriority === "HIGH" || data.approvalPriority === "NORMAL"
          ? data.approvalPriority
          : undefined,
    });

    revalidateTag(`store-${business.slug}`, { expire: 0 });
    revalidateTag(`catalog-${business.id}`, { expire: 0 });

    const store = await prisma.business.findUnique({
      where: { id: business.id },
      select: {
        id: true,
        name: true,
        slug: true,
        approvalStatus: true,
        rejectionReason: true,
        resubmissionAllowed: true,
        owner: { select: { name: true, email: true } },
      },
    });

    if (store?.owner) {
      if (store.approvalStatus === "APPROVED") {
        sendStoreApprovedEmail({
          ownerName: store.owner.name,
          ownerEmail: store.owner.email,
          storeName: store.name,
          storeSlug: store.slug,
          businessId: store.id,
        });
      } else if (store.approvalStatus === "REJECTED" && store.rejectionReason) {
        sendStoreRejectedEmail({
          ownerName: store.owner.name,
          ownerEmail: store.owner.email,
          storeName: store.name,
          businessId: store.id,
          reason: store.rejectionReason,
          canResubmit: store.resubmissionAllowed,
        });
      }
    }

    return NextResponse.json({
      business: {
        id: business.id,
        slug: business.slug,
        approvalStatus: business.approvalStatus,
        isActive: business.isActive,
        plan: business.plan,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed." },
      { status: 400 },
    );
  }
}