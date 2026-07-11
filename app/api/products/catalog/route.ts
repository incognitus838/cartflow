import { NextResponse } from "next/server";
import { requireApprovedStore } from "@/lib/api/require-business";
import { normalizeCategoryName } from "@/lib/products/catalog-layout";
import { moveProductsToCategory } from "@/lib/products/mutations";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import { revalidateStorefrontCatalog } from "@/lib/storefront/revalidate-catalog";
import { listBusinessProducts } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const category =
    typeof data.category === "string" ? normalizeCategoryName(data.category) : "";
  const productIds = Array.isArray(data.productIds)
    ? [
        ...new Set(
          data.productIds.filter(
            (id): id is string => typeof id === "string" && id.trim().length > 0,
          ),
        ),
      ]
    : [];

  if (!category) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Select at least one product." }, { status: 400 });
  }

  try {
    const result = await moveProductsToCategory(auth.business.id, productIds, category);
    revalidateStorefrontCatalog(auth.business.id, auth.business.slug);
    const products = normalizeProductsForList(await listBusinessProducts(auth.business.id));

    return NextResponse.json({
      moved: result.moved,
      skipped: result.skipped,
      category,
      products,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not move products.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}