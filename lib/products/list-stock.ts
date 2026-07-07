import { getLowStockThreshold, getProductStock } from "@/lib/inventory-stock";

type VariantRow = { stock: unknown; [key: string]: unknown };

type ListProductLike = {
  stock: unknown;
  lowStockThreshold: unknown;
  variants?: VariantRow[] | null;
  [key: string]: unknown;
};

/** Normalize list/API rows so stock and threshold always match DB variant totals. */
export function normalizeProductForList<T extends ListProductLike>(product: T) {
  const variants = (product.variants ?? []).map((variant) => ({
    ...variant,
    stock: Number(variant.stock ?? 0),
  }));
  const stock = getProductStock({ stock: product.stock, variants });
  const lowStockThreshold = getLowStockThreshold(product);

  return {
    ...product,
    stock,
    lowStockThreshold,
    sortOrder: Number(product.sortOrder ?? 0),
    variants,
  };
}

export function normalizeProductsForList<T extends ListProductLike>(products: T[]) {
  return products.map(normalizeProductForList);
}