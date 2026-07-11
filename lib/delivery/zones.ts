import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal";
import type { DeliveryZonePublic, DeliveryZoneRecord } from "@/lib/delivery/types";

export function serializeDeliveryZone(zone: {
  id: string;
  name: string;
  fee: { toString(): string } | number;
  sortOrder: number;
  isActive: boolean;
}): DeliveryZoneRecord {
  return {
    id: zone.id,
    name: zone.name,
    fee: toNumber(zone.fee),
    sortOrder: zone.sortOrder,
    isActive: zone.isActive,
  };
}

export function serializePublicZone(zone: {
  id: string;
  name: string;
  fee: { toString(): string } | number;
}): DeliveryZonePublic {
  return {
    id: zone.id,
    name: zone.name,
    fee: toNumber(zone.fee),
  };
}

export async function listBusinessDeliveryZones(businessId: string) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { businessId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return zones.map(serializeDeliveryZone);
  } catch (error) {
    console.error("[delivery-zones] listBusinessDeliveryZones failed:", error);
    return [];
  }
}

export async function listActiveDeliveryZones(businessId: string) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, fee: true },
    });
    return zones.map(serializePublicZone);
  } catch (error) {
    console.error("[delivery-zones] listActiveDeliveryZones failed:", error);
    return [];
  }
}

export function minZoneFee(zones: Array<{ fee: number }>, fallback: number) {
  if (zones.length === 0) return fallback;
  return Math.min(...zones.map((z) => z.fee));
}

export type ResolvedDelivery = {
  fee: number;
  zoneId: string | null;
  zoneName: string | null;
};

export async function resolveOrderDelivery(
  businessId: string,
  needsDelivery: boolean,
  deliveryZoneId?: string | null,
): Promise<ResolvedDelivery> {
  if (!needsDelivery) {
    return { fee: 0, zoneId: null, zoneName: null };
  }

  const activeZones = await listActiveDeliveryZones(businessId);

  if (activeZones.length === 0) {
    const zoneCount = await prisma.deliveryZone.count({ where: { businessId } });
    if (zoneCount > 0) {
      throw new Error("Delivery is not available for this store right now.");
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { deliveryFee: true },
    });
    const fee = business ? toNumber(business.deliveryFee) : 0;
    return { fee, zoneId: null, zoneName: null };
  }

  if (!deliveryZoneId) {
    throw new Error("Choose a delivery location before placing your order.");
  }

  const zone = activeZones.find((z) => z.id === deliveryZoneId);
  if (!zone) {
    throw new Error("Invalid delivery location. Refresh the page and try again.");
  }

  return { fee: zone.fee, zoneId: zone.id, zoneName: zone.name };
}