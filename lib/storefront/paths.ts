export function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
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

export function orderConfirmationPath(storeSlug: string, orderNumber: string) {
  return `/${storeSlug}/order/${orderNumber}`;
}

export function absoluteStoreUrl(storeSlug: string) {
  return `${getAppBaseUrl()}${storePath(storeSlug)}`;
}

export function absoluteProductUrl(storeSlug: string, productId: string) {
  return `${getAppBaseUrl()}${productPath(storeSlug, productId)}`;
}