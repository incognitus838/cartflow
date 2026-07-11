import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseProductMetadata } from "@/lib/products/metadata";
import { getStorefrontBySlug } from "@/lib/queries/storefront";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ storeSlug: string }> };

/** Resolve product types for cart lines (client enrichment). */
export async function GET(request: Request, context: RouteContext) {
  const { storeSlug } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const idsParam = new URL(request.url).searchParams.get("ids") ?? "";
  const productIds = [...new Set(idsParam.split(",").map((id) => id.trim()).filter(Boolean))];

  if (productIds.length === 0) {
    return NextResponse.json({ types: {} });
  }

  const products = await prisma.product.findMany({
    where: { businessId: store.id, id: { in: productIds.slice(0, 50) } },
    select: { id: true, metadata: true },
  });

  const types = Object.fromEntries(
    products.map((product) => [
      product.id,
      parseProductMetadata(product.metadata).productType,
    ]),
  );

  return NextResponse.json({ types });
}