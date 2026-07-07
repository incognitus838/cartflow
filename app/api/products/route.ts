import { NextResponse } from "next/server";
import { requireApiBusiness, requireApprovedStore } from "@/lib/api/require-business";
import { createProduct } from "@/lib/products/mutations";
import { parseProductInput } from "@/lib/products/validation";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import { listBusinessProducts } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const products = await listBusinessProducts(auth.business.id, {
    search,
    status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" | undefined,
  });

  return NextResponse.json({ products: normalizeProductsForList(products) });
}

export async function POST(request: Request) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  let parsed;
  try {
    parsed = parseProductInput(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid product data." },
      { status: 400 },
    );
  }

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const product = await createProduct(auth.business.id, parsed);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create product." },
      { status: 400 },
    );
  }
}