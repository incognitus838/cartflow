import { NextResponse } from "next/server";
import { requireApiBusiness } from "@/lib/api/require-business";
import { parsePaymentReview, reviewOrderPayment } from "@/lib/orders/payment-review";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parsePaymentReview(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const order = await reviewOrderPayment(auth.business.id, id, {
      ...parsed,
      actorName: parsed.actorName ?? auth.session.name,
    });
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not review payment.";
    const status = message === "Order not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}