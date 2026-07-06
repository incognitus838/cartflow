import { NextResponse } from "next/server";
import { phonesMatch } from "@/lib/orders/phone";
import { toPublicOrderSnapshot } from "@/lib/orders/tracking";
import { getStoreOrder, getStorefrontBySlug } from "@/lib/queries/storefront";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

async function resolveOrder(storeSlug: string, orderNumber: string) {
  const store = await getStorefrontBySlug(storeSlug);
  if (!store) return { error: "Store not found.", status: 404 as const };

  const order = await getStoreOrder(store.id, normalizeOrderNumber(orderNumber));
  if (!order) return { error: "Order not found. Check your order ID.", status: 404 as const };

  return { store, order };
}

/** POST — verify phone and return a safe order snapshot for tracking. */
export async function POST(request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const resolved = await resolveOrder(storeSlug, orderNumber);

  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const body = await request.json().catch(() => null);
  const customerPhone =
    body && typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";

  if (!customerPhone || customerPhone.length < 7) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  if (!phonesMatch(customerPhone, resolved.order.customerPhone)) {
    return NextResponse.json(
      { error: "Phone number does not match this order." },
      { status: 403 },
    );
  }

  return NextResponse.json({ order: toPublicOrderSnapshot(resolved.order) });
}

/** GET — poll order status (requires matching phone query param). */
export async function GET(request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const resolved = await resolveOrder(storeSlug, orderNumber);

  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const customerPhone = new URL(request.url).searchParams.get("phone")?.trim() ?? "";

  if (!customerPhone || !phonesMatch(customerPhone, resolved.order.customerPhone)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  return NextResponse.json({ order: toPublicOrderSnapshot(resolved.order) });
}