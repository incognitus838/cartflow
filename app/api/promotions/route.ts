import { NextResponse } from "next/server";
import { requireApiBusiness, requireLiveStore } from "@/lib/api/require-business";
import { createPromotion } from "@/lib/promotions/mutations";
import { parsePromotionInput } from "@/lib/promotions/validation";
import { listBusinessPromotions } from "@/lib/queries/dashboard";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const promotions = await listBusinessPromotions(auth.business.id);
  return NextResponse.json({ promotions });
}

export async function POST(request: Request) {
  const auth = await requireLiveStore();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parsePromotionInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const promotion = await createPromotion(auth.business.id, parsed);
    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create promotion." },
      { status: 400 },
    );
  }
}