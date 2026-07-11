import { NextResponse } from "next/server";
import { normalizeOrderNumber } from "@/lib/order-number";
import { toPublicOrderSnapshot } from "@/lib/orders/tracking";
import { getStoreOrder, getStorefrontBySlug } from "@/lib/queries/storefront";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

async function resolveOrder(storeSlug: string, orderNumber: string) {
  const store = await getStorefrontBySlug(storeSlug);
  if (!store) return { error: "Store not found.", status: 404 as const };

  const order = await getStoreOrder(store.id, normalizeOrderNumber(orderNumber));
  if (!order) return { error: "Order not found. Check your order ID.", status: 404 as const };

  return { store, order };
}

function snapshotResponse(
  store: { name: string; slug: string; currency: string },
  order: NonNullable<Awaited<ReturnType<typeof getStoreOrder>>>,
) {
  return NextResponse.json({
    order: toPublicOrderSnapshot(order, {
      name: store.name,
      slug: store.slug,
      currency: store.currency,
    }),
  });
}

/** POST — look up order by ID for tracking. */
export async function POST(_request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const resolved = await resolveOrder(storeSlug, orderNumber);

  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  return snapshotResponse(resolved.store, resolved.order);
}

/** GET — poll order status by ID. */
export async function GET(_request: Request, context: RouteContext) {
  const { storeSlug, orderNumber } = await context.params;
  const resolved = await resolveOrder(storeSlug, orderNumber);

  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  return snapshotResponse(resolved.store, resolved.order);
}