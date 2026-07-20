import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { getAdminOrder } from "@/lib/admin/order-detail";
import { parsePaymentReview, reviewOrderPayment } from "@/lib/orders/payment-review";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Platform admin payment review — does not use seller store auth
 * (seller requireApiBusiness clears the session when the admin has no store access).
 */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const existing = await getAdminOrder(id);

  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parsePaymentReview(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const order = await reviewOrderPayment(existing.businessId, id, {
      ...parsed,
      actorName: parsed.actorName ?? `${auth.session.name} (admin)`,
      actorUserId: auth.session.userId,
      actorRole: "admin",
    });
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not review payment.";
    const status = message === "Order not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
