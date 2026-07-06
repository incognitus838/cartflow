import { NextResponse } from "next/server";
import { getAdminOrder } from "@/lib/admin/order-detail";
import { requireApiAdmin } from "@/lib/api/require-admin";
import { buildReceiptResponse } from "@/lib/orders/receipt-response";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const order = await getAdminOrder(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const response = buildReceiptResponse({
    paymentReceiptData: order.paymentReceiptData,
    paymentReceiptMimeType: order.paymentReceiptMimeType,
    paymentReceiptFilename: order.paymentReceiptFilename,
  });

  if (!response) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }

  return response;
}