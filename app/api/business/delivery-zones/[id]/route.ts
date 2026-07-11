import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api/require-business";
import { prisma } from "@/lib/db";
import { revalidateStoreDelivery } from "@/lib/delivery/revalidate";
import { serializeDeliveryZone } from "@/lib/delivery/zones";
import { parseDeliveryZonePatch } from "@/lib/delivery/validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = parseDeliveryZonePatch(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const existing = await prisma.deliveryZone.findFirst({
    where: { id, businessId: auth.business.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Delivery zone not found." }, { status: 404 });
  }

  const zone = await prisma.deliveryZone.update({
    where: { id },
    data: parsed,
  });

  revalidateStoreDelivery(auth.business.slug);
  return NextResponse.json({ zone: serializeDeliveryZone(zone) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.deliveryZone.findFirst({
    where: { id, businessId: auth.business.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Delivery zone not found." }, { status: 404 });
  }

  await prisma.deliveryZone.delete({ where: { id } });
  revalidateStoreDelivery(auth.business.slug);
  return NextResponse.json({ ok: true });
}