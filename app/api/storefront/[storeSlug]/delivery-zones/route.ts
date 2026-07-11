import { NextResponse } from "next/server";
import { listActiveDeliveryZones } from "@/lib/delivery/zones";
import { getStorefrontBySlug } from "@/lib/queries/storefront";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ storeSlug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { storeSlug } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const zones = await listActiveDeliveryZones(store.id);
  return NextResponse.json({ zones });
}