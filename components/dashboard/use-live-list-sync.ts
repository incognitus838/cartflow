"use client";

import { useCallback, useEffect } from "react";
import {
  CATALOG_CHANGED_EVENT,
  PRODUCTS_CHANGED_EVENT,
  consumeCatalogStaleFlag,
  consumeProductsStaleFlag,
} from "@/lib/dashboard/live-sync";

type UseLiveListSyncOptions = {
  onSync: () => void | Promise<void>;
  watchProducts?: boolean;
  watchCatalog?: boolean;
  refetchOnMount?: boolean;
};

export function useLiveListSync({
  onSync,
  watchProducts = true,
  watchCatalog = false,
  refetchOnMount = true,
}: UseLiveListSyncOptions) {
  const sync = useCallback(() => {
    void onSync();
  }, [onSync]);

  useEffect(() => {
    if (!refetchOnMount) return;
    if (consumeProductsStaleFlag() || consumeCatalogStaleFlag()) {
      sync();
    }
  }, [refetchOnMount, sync]);

  useEffect(() => {
    const events: string[] = [];
    if (watchProducts) events.push(PRODUCTS_CHANGED_EVENT);
    if (watchCatalog) events.push(CATALOG_CHANGED_EVENT);

    for (const event of events) {
      window.addEventListener(event, sync);
    }
    return () => {
      for (const event of events) {
        window.removeEventListener(event, sync);
      }
    };
  }, [sync, watchCatalog, watchProducts]);
}