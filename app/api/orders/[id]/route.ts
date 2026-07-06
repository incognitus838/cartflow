import { NextResponse } from "next/server";
import { requireApiBusiness } from "@/lib/api/require-business";
import { parseOrderUpdate, updateBusinessOrder } from "@/lib/orders/update";
import { getBusinessOrder } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const order = await getBusinessOrder(auth.business.id, id);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parseOrderUpdate(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const order = await updateBusinessOrder(auth.business.id, id, parsed);
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update order.";
    const status = message === "Order not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}