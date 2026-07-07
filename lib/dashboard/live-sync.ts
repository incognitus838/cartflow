export const PRODUCTS_CHANGED_EVENT = "cartflow:products-changed";
export const CATALOG_CHANGED_EVENT = "cartflow:catalog-changed";

const PRODUCTS_STALE_KEY = "cartflow:products-stale";
const CATALOG_STALE_KEY = "cartflow:catalog-stale";

export function notifyProductsChanged() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(PRODUCTS_STALE_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT));
  }
}

export function notifyCatalogChanged() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(CATALOG_STALE_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent(CATALOG_CHANGED_EVENT));
  }
}

export function consumeProductsStaleFlag() {
  if (typeof window === "undefined") return false;
  const stale = sessionStorage.getItem(PRODUCTS_STALE_KEY);
  if (!stale) return false;
  sessionStorage.removeItem(PRODUCTS_STALE_KEY);
  return true;
}

export function consumeCatalogStaleFlag() {
  if (typeof window === "undefined") return false;
  const stale = sessionStorage.getItem(CATALOG_STALE_KEY);
  if (!stale) return false;
  sessionStorage.removeItem(CATALOG_STALE_KEY);
  return true;
}