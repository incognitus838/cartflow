import { NextResponse } from "next/server";
import { requireApiBusiness, requireApiPermission, requireApprovedStore } from "@/lib/api/require-business";
import { deleteProduct, updateProduct } from "@/lib/products/mutations";
import { parseProductInput } from "@/lib/products/validation";
import { getBusinessProduct } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const product = await getBusinessProduct(auth.business.id, id);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const { id } = await context.params;
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
    const product = await updateProduct(auth.business.id, id, parsed);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product.";
    const status = message === "Product not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiPermission("productsDelete");
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await deleteProduct(auth.business.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete product.";
    const status = message === "Product not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}