import { NextResponse } from "next/server";
import { buildReceiptResponse } from "@/lib/orders/receipt-response";
import { getStorefrontOrderReceiptBlob, submitOrderReceipt } from "@/lib/orders/receipt";
import { getStorefrontBySlug } from "@/lib/queries/storefront";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

/** GET — stream receipt bytes from the database (no local files). */
export async function GET(_request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const order = await getStorefrontOrderReceiptBlob(store.id, orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const response = buildReceiptResponse(order);
  if (!response) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }

  return response;
}

/** POST — legacy fallback for orders placed without a receipt at checkout. */
export async function POST(request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("receipt");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please upload a payment receipt." }, { status: 400 });
  }

  try {
    const order = await submitOrderReceipt(store.id, orderNumber, file);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload receipt." },
      { status: 400 },
    );
  }
}