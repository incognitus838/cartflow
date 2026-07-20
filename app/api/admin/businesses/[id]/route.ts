import { NextResponse } from "next/server";
import type { BusinessPlan } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { setBusinessActive, setBusinessPlan } from "@/lib/admin/queries";
import {
  getBusinessForAdminAction,
  permanentlyDeleteBusiness,
  restoreBusiness,
  softDeleteBusiness,
  suspendBusiness,
  unsuspendBusiness,
} from "@/lib/admin/store-lifecycle";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_PLANS = Object.keys(PLANS) as BusinessPlan[];

function revalidateStore(slug: string, businessId: string) {
  revalidateTag(`store-${slug}`, { expire: 0 });
  revalidateTag(`catalog-${businessId}`, { expire: 0 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const action = typeof data.action === "string" ? data.action : null;
  const reason = typeof data.reason === "string" ? data.reason : undefined;

  try {
    if (action === "suspend") {
      const business = await suspendBusiness(id, {
        adminUserId: auth.session.userId,
        adminName: auth.session.name,
        reason,
      });
      revalidateStore(business.slug, business.id);
      return NextResponse.json({ business });
    }

    if (action === "unsuspend") {
      const business = await unsuspendBusiness(id, {
        adminUserId: auth.session.userId,
        adminName: auth.session.name,
      });
      revalidateStore(business.slug, business.id);
      return NextResponse.json({ business });
    }

    if (action === "soft_delete") {
      const business = await softDeleteBusiness(id, {
        adminUserId: auth.session.userId,
        adminName: auth.session.name,
        reason,
      });
      revalidateStore(business.slug, business.id);
      return NextResponse.json({ business });
    }

    if (action === "restore") {
      const business = await restoreBusiness(id, {
        adminUserId: auth.session.userId,
        adminName: auth.session.name,
      });
      revalidateStore(business.slug, business.id);
      return NextResponse.json({ business });
    }

    if (typeof data.isActive === "boolean") {
      const existing = await getBusinessForAdminAction(id);
      if (!existing) {
        return NextResponse.json({ error: "Store not found." }, { status: 404 });
      }
      if (existing.deletedAt) {
        return NextResponse.json(
          { error: "Restore this store from the recycle bin first." },
          { status: 400 },
        );
      }
      if (existing.isSuspended && data.isActive) {
        return NextResponse.json(
          { error: "Unsuspend the store before activating it." },
          { status: 400 },
        );
      }
      const business = await setBusinessActive(id, data.isActive);
      revalidateStore(business.slug, business.id);
      return NextResponse.json({
        business: {
          id: business.id,
          isActive: business.isActive,
          plan: business.plan,
          isSuspended: existing.isSuspended,
        },
      });
    }

    if (typeof data.plan === "string" && VALID_PLANS.includes(data.plan as BusinessPlan)) {
      const business = await setBusinessPlan(id, data.plan);
      return NextResponse.json({
        business: { id: business.id, isActive: business.isActive, plan: business.plan },
      });
    }

    return NextResponse.json(
      {
        error:
          "Provide action (suspend|unsuspend|soft_delete|restore), isActive, or plan.",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const confirm = body && typeof body === "object" ? (body as { confirm?: string }).confirm : null;

  if (confirm !== "DELETE") {
    return NextResponse.json(
      { error: 'Send { "confirm": "DELETE" } to permanently remove this store.' },
      { status: 400 },
    );
  }

  try {
    const existing = await getBusinessForAdminAction(id);
    if (!existing) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const result = await permanentlyDeleteBusiness(id);
    revalidateStore(result.slug, result.id);
    return NextResponse.json({ ok: true, deleted: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed." },
      { status: 400 },
    );
  }
}
