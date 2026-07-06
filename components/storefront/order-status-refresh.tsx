"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type OrderStatusRefreshProps = {
  enabled?: boolean;
  intervalMs?: number;
};

/** Polls the server for order status changes (seller updates in dashboard). */
export function OrderStatusRefresh({ enabled = true, intervalMs = 30_000 }: OrderStatusRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, router]);

  return null;
}