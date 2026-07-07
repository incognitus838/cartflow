function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

export function getProductStock(product: {
  stock: unknown;
  variants?: Array<{ stock: unknown }> | null;
}) {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    return variants.reduce((sum, variant) => sum + toInt(variant.stock), 0);
  }
  return toInt(product.stock);
}

export function getLowStockThreshold(product: { lowStockThreshold: unknown }) {
  return toInt(product.lowStockThreshold);
}

/** Low stock is based on total available units, not individual variants. */
export function isLowStock(product: {
  stock: unknown;
  lowStockThreshold: unknown;
  variants?: Array<{ stock: unknown }> | null;
}) {
  const available = getProductStock(product);
  const threshold = getLowStockThreshold(product);
  return available > 0 && available <= threshold;
}

export function isOutOfStock(product: {
  stock: unknown;
  variants?: Array<{ stock: unknown }> | null;
}) {
  return getProductStock(product) <= 0;
}