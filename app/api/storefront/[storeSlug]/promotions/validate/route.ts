import { NextResponse } from "next/server";
import { toNumber } from "@/lib/decimal";
import { applyPromotionCode } from "@/lib/promotions/apply";
import { getStorefrontBySlug } from "@/lib/queries/storefront";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ storeSlug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { storeSlug } = await context.params;
  const store = await getStorefrontBySlug(storeSlug);

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data = body as Record<string, unknown> | null;
  const code = typeof data?.code === "string" ? data.code.trim() : "";
  const items = Array.isArray(data?.items) ? data.items : [];

  if (!code) {
    return NextResponse.json({ error: "Enter a promo code." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const productIds = [...new Set(items.map((row) => (row as { productId?: string }).productId).filter(Boolean))] as string[];

  const products = await prisma.product.findMany({
    where: { businessId: store.id, id: { in: productIds }, status: "ACTIVE" },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = items.map((row) => {
    const item = row as { productId: string; variantId?: string; quantity: number };
    const product = productMap.get(item.productId);
    if (!product) throw new Error("A product in your cart is no longer available.");

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;
    const unitPrice = variant?.price != null ? toNumber(variant.price) : toNumber(product.price);

    return {
      productId: product.id,
      variantId: variant?.id,
      quantity: item.quantity,
      unitPrice,
    };
  });

  try {
    const applied = await applyPromotionCode(store.id, code, lines);
    return NextResponse.json({ promotion: applied });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid promo code." },
      { status: 400 },
    );
  }
}