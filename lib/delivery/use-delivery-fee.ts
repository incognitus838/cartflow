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
  onSelectZone?: (zoneId: string) => void;
};

export function useDeliveryZones(storeSlug: string) {
  const [zones, setZones] = useState<DeliveryZonePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/storefront/${storeSlug}/delivery-zones`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && Array.isArray(data.zones)) {
          setZones(data.zones);
          setError(null);
        } else {
          setZones([]);
          setError(data.error ?? "Could not load delivery locations.");
        }
      } catch {
        if (!cancelled) {
          setZones([]);
          setError("Could not load delivery locations.");
        }
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

  return { zones, loading, error };
}

export function useDeliveryFee({
  storeSlug,
  lines,
  fallbackDeliveryFee,
  selectedZoneId,
  onSelectZone,
}: UseDeliveryFeeArgs) {
  const { zones, loading, error } = useDeliveryZones(storeSlug);
  const needsDelivery = cartNeedsDelivery(lines);

  useEffect(() => {
    if (!needsDelivery || zones.length !== 1 || selectedZoneId || !onSelectZone) return;
    onSelectZone(zones[0].id);
  }, [needsDelivery, onSelectZone, selectedZoneId, zones]);

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
    error,
    needsDelivery,
    effectiveFee,
    selectedZoneName,
    requiresZoneSelection,
    hasZones: zones.length > 0,
  };
}