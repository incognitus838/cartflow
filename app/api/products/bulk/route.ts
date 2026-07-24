import { NextResponse } from "next/server";
import { requireApprovedStore } from "@/lib/api/require-business";
import { createProductsBulk, type BulkProductRow } from "@/lib/products/bulk";
import { revalidateStorefrontCatalog } from "@/lib/storefront/revalidate-catalog";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const defaultCategory =
    typeof data.defaultCategory === "string" ? data.defaultCategory.trim() : "General";

  const rawProducts = Array.isArray(data.products) ? data.products : null;
  if (!rawProducts) {
    return NextResponse.json({ error: "products array is required." }, { status: 400 });
  }

  const rows: BulkProductRow[] = [];
  for (const item of rawProducts) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const price = Number(row.price);
    if (!title || !Number.isFinite(price)) continue;
    rows.push({
      title,
      price,
      description: typeof row.description === "string" ? row.description : undefined,
      category: typeof row.category === "string" ? row.category : undefined,
      stock: typeof row.stock === "number" ? row.stock : undefined,
    });
  }

  try {
    const result = await createProductsBulk(auth.business.id, rows, { defaultCategory });
    if (result.created > 0) {
      revalidateStorefrontCatalog(auth.business.id, auth.business.slug);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk import failed." },
      { status: 400 },
    );
  }
}
