import { NextResponse } from "next/server";
import { requireApiBusiness, requireLiveStore } from "@/lib/api/require-business";
import { deletePromotion, updatePromotion } from "@/lib/promotions/mutations";
import { parsePromotionInput } from "@/lib/promotions/validation";
import { getBusinessPromotion } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const promotion = await getBusinessPromotion(auth.business.id, id);

  if (!promotion) {
    return NextResponse.json({ error: "Promotion not found." }, { status: 404 });
  }

  return NextResponse.json({ promotion });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireLiveStore();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parsePromotionInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const promotion = await updatePromotion(auth.business.id, id, parsed);
    return NextResponse.json({ promotion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update promotion.";
    const status = message === "Promotion not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireLiveStore();
  if (auth.error) return auth.error;
  if (!auth.permissions.promotionsDelete) {
    return NextResponse.json({ error: "You do not have permission for this action." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await deletePromotion(auth.business.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete promotion.";
    const status = message === "Promotion not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}