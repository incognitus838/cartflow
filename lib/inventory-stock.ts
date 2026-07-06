export function getProductStock(product: {
  stock: number;
  variants: Array<{ stock: number }>;
}) {
  if (product.variants.length > 0) {
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  return product.stock;
}

export function isLowStock(product: {
  stock: number;
  lowStockThreshold: number;
  variants: Array<{ stock: number }>;
}) {
  const available = getProductStock(product);
  return available > 0 && available <= product.lowStockThreshold;
}

export function isOutOfStock(product: {
  stock: number;
  variants: Array<{ stock: number }>;
}) {
  return getProductStock(product) <= 0;
}