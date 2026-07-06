import { NextResponse } from "next/server";
import { requireApiBusiness } from "@/lib/api/require-business";
import { buildReceiptResponse } from "@/lib/orders/receipt-response";
import { getOrderReceiptBlob } from "@/lib/orders/receipt";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** GET — seller dashboard: stream receipt from database. */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const order = await getOrderReceiptBlob(auth.business.id, id);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const response = buildReceiptResponse(order);
  if (!response) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }

  return response;
}