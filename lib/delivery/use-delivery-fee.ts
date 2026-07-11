"use client";

import { useEffect, useMemo, useState } from "react";
import { cartNeedsDelivery } from "@/lib/delivery/deliverable";
import type { DeliveryZonePublic } from "@/lib/delivery/types";
import type { CartLine } from "@/lib/cart/types";

type UseDeliveryFeeArgs = {
  storeSlug: string;
  lines: CartLine[];
  fallbackDeliveryFee: number;
  selectedZoneId: string | null;
};

export function useDeliveryZones(storeSlug: string) {
  const [zones, setZones] = useState<DeliveryZonePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/storefront/${storeSlug}/delivery-zones`);
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.zones)) {
          setZones(data.zones);
        }
      } catch {
        if (!cancelled) setZones([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  return { zones, loading };
}

export function useDeliveryFee({
  storeSlug,
  lines,
  fallbackDeliveryFee,
  selectedZoneId,
}: UseDeliveryFeeArgs) {
  const { zones, loading } = useDeliveryZones(storeSlug);
  const needsDelivery = cartNeedsDelivery(lines);

  const effectiveFee = useMemo(() => {
    if (!needsDelivery) return 0;
    if (zones.length > 0) {
      const zone = zones.find((z) => z.id === selectedZoneId);
      return zone ? zone.fee : 0;
    }
    return fallbackDeliveryFee;
  }, [fallbackDeliveryFee, needsDelivery, selectedZoneId, zones]);

  const selectedZoneName = useMemo(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId)?.name ?? null;
  }, [selectedZoneId, zones]);

  const requiresZoneSelection = needsDelivery && zones.length > 0 && !selectedZoneId;

  return {
    zones,
    loading,
    needsDelivery,
    effectiveFee,
    selectedZoneName,
    requiresZoneSelection,
    hasZones: zones.length > 0,
  };
}