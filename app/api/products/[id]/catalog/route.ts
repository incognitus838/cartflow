import { NextResponse } from "next/server";
import { requireApprovedStore } from "@/lib/api/require-business";
import { normalizeCategoryName } from "@/lib/products/catalog-layout";
import { moveProductToCategory, reorderProductInCategory } from "@/lib/products/mutations";
import { normalizeProductForList } from "@/lib/products/list-stock";
import { revalidateStorefrontCatalog } from "@/lib/storefront/revalidate-catalog";
import { getBusinessProduct } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

async function loadListProduct(businessId: string, productId: string) {
  const product = await getBusinessProduct(businessId, productId);
  if (!product) return null;
  return normalizeProductForList({
    ...product,
    _count: { variants: product.variants.length },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  try {
    if (typeof data.direction === "string") {
      if (data.direction !== "up" && data.direction !== "down") {
        return NextResponse.json({ error: "Direction must be up or down." }, { status: 400 });
      }
      await reorderProductInCategory(auth.business.id, id, data.direction);
    } else if (typeof data.category === "string") {
      const category = normalizeCategoryName(data.category);
      if (!category) {
        return NextResponse.json({ error: "Category is required." }, { status: 400 });
      }
      await moveProductToCategory(auth.business.id, id, category);
    } else {
      return NextResponse.json({ error: "Provide category or direction." }, { status: 400 });
    }

    revalidateStorefrontCatalog(auth.business.id, auth.business.slug);

    const product = await loadListProduct(auth.business.id, id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update catalog placement.";
    const status = message === "Product not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}