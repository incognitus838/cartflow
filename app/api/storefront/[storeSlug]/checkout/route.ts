import { NextResponse } from "next/server";
import { isDemoStoreSlug } from "@/lib/demo/is-demo-store";
import { createGuestOrderWithNotify } from "@/lib/orders/create";
import { buildDemoCheckoutReceipt } from "@/lib/orders/demo-receipt";
import { parseCheckoutFormData } from "@/lib/orders/validation";
import { getStorefrontBySlug } from "@/lib/queries/storefront";
import { parseReceiptFile } from "@/lib/uploads/receipt";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ storeSlug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { storeSlug } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const isDemo = isDemoStoreSlug(store.slug);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      {
        error: isDemo
          ? "Checkout requires form data."
          : "Checkout requires multipart form data with a payment receipt.",
      },
      { status: 400 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid checkout submission." }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parseCheckoutFormData(formData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid checkout data." },
      { status: 400 },
    );
  }

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  let receipt;
  if (isDemo) {
    // Never require a real transfer or bank receipt on public demos.
    receipt = buildDemoCheckoutReceipt();
  } else {
    const receiptFile = formData.get("receipt");
    if (!(receiptFile instanceof File) || receiptFile.size === 0) {
      return NextResponse.json(
        { error: "Upload your payment receipt (screenshot or PDF) before placing the order." },
        { status: 400 },
      );
    }

    try {
      receipt = await parseReceiptFile(receiptFile);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid receipt file." },
        { status: 400 },
      );
    }
  }

  try {
    const order = await createGuestOrderWithNotify(store.id, parsed, receipt);
    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        hasReceipt: true,
        demo: isDemo,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not place order." },
      { status: 400 },
    );
  }
}