export const CANONICAL_APP_URL = "https://cartflow.com.ng";

const LOCAL_DEV_URL = "http://localhost:3001";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

/**
 * Public site origin for share links, emails, and metadata.
 * Prefers cartflow.com.ng over legacy *.vercel.app deployment URLs.
 */
export function getAppBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const normalized = fromEnv ? normalizeBaseUrl(fromEnv) : "";

  if (normalized.includes("vercel.app")) {
    return CANONICAL_APP_URL;
  }

  if (normalized && !normalized.includes("localhost")) {
    return normalized;
  }

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return CANONICAL_APP_URL;
  }

  return normalized || LOCAL_DEV_URL;
}

/** Safe for client components where NEXT_PUBLIC_APP_URL is inlined at build time. */
export function getPublicAppBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const normalized = fromEnv ? normalizeBaseUrl(fromEnv) : "";

  if (normalized.includes("vercel.app")) {
    return CANONICAL_APP_URL;
  }

  if (normalized.includes("localhost")) {
    return normalized || LOCAL_DEV_URL;
  }

  return normalized || CANONICAL_APP_URL;
}

export function storePath(storeSlug: string) {
  return `/${storeSlug}`;
}

export function productPath(storeSlug: string, productId: string) {
  return `/${storeSlug}/products/${productId}`;
}

export function cartPath(storeSlug: string) {
  return `/${storeSlug}/cart`;
}

export function checkoutPath(storeSlug: string) {
  return `/${storeSlug}/checkout`;
}

export function orderConfirmationPath(
  storeSlug: string,
  orderNumber: string,
  options?: { justPlaced?: boolean },
) {
  const base = `/${storeSlug}/order/${orderNumber}`;
  return options?.justPlaced ? `${base}?placed=1` : base;
}

export function trackOrderPath(storeSlug: string) {
  return `/${storeSlug}/track`;
}

export function trackOrderLookupPath(storeSlug: string, orderNumber: string) {
  const params = new URLSearchParams({
    order: orderNumber.trim().toUpperCase(),
  });
  return `/${storeSlug}/track?${params}`;
}

export function absoluteStoreUrl(storeSlug: string) {
  return `${getAppBaseUrl()}${storePath(storeSlug)}`;
}

export function absoluteProductUrl(storeSlug: string, productId: string) {
  return `${getAppBaseUrl()}${productPath(storeSlug, productId)}`;
}