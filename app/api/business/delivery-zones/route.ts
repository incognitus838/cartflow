import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api/require-business";
import { prisma } from "@/lib/db";
import { listBusinessDeliveryZones, serializeDeliveryZone } from "@/lib/delivery/zones";
import { parseDeliveryZoneInput } from "@/lib/delivery/validation";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const zones = await listBusinessDeliveryZones(auth.business.id);
  return NextResponse.json({ zones });
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseDeliveryZoneInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const maxSort = await prisma.deliveryZone.aggregate({
    where: { businessId: auth.business.id },
    _max: { sortOrder: true },
  });

  const zone = await prisma.deliveryZone.create({
    data: {
      businessId: auth.business.id,
      name: parsed.name,
      fee: parsed.fee,
      sortOrder: parsed.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1,
      isActive: parsed.isActive ?? true,
    },
  });

  return NextResponse.json({ zone: serializeDeliveryZone(zone) }, { status: 201 });
}