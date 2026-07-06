export function storefrontOrderReceiptUrl(storeSlug: string, orderNumber: string) {
  return `/api/storefront/${storeSlug}/orders/${orderNumber}/receipt`;
}

export function dashboardOrderReceiptUrl(orderId: string) {
  return `/api/orders/${orderId}/receipt`;
}

export function adminOrderReceiptUrl(orderId: string) {
  return `/api/admin/orders/${orderId}/receipt`;
}