"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminSyncPayload = {
  pendingCount: number;
  users: number;
  businesses: number;
  syncedAt: string;
};

export function useAdminLiveSync(initialPendingCount: number, intervalMs = 15_000) {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(initialPendingCount);
  const lastRefreshKey = useRef<string | null>(null);

  useEffect(() => {
    setPendingCount(initialPendingCount);
  }, [initialPendingCount]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/sync", { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const data = (await res.json()) as AdminSyncPayload;
        if (cancelled) return;

        setPendingCount(data.pendingCount);

        const refreshKey = `${data.pendingCount}:${data.users}:${data.businesses}`;
        if (lastRefreshKey.current !== null && lastRefreshKey.current !== refreshKey) {
          router.refresh();
        }
        lastRefreshKey.current = refreshKey;
      } catch {
        /* ignore transient network errors */
      }
    }

    poll();
    const timer = window.setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [intervalMs, router]);

  return pendingCount;
}