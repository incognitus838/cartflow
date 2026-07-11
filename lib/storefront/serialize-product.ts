import { toNumber } from "@/lib/decimal";
import { getProductStock } from "@/lib/inventory-stock";
import { parseProductMetadata } from "@/lib/products/metadata";
import type { ProductType } from "@/lib/products/product-types";

type Decimalish = { toString(): string } | number | string | null | undefined;

function toPrice(value: Decimalish) {
  if (value == null) return null;
  return toNumber(value);
}

export function serializeStoreProduct<
  T extends {
    stock?: unknown;
    price: Decimalish;
    compareAtPrice?: Decimalish;
    metadata?: unknown;
    variants: Array<{ stock?: unknown; price?: Decimalish }>;
  },
>(product: T) {
  const productType: ProductType = parseProductMetadata(product.metadata).productType;
  const variants = product.variants.map((variant) => ({
    ...variant,
    stock: Math.max(0, Math.trunc(Number(variant.stock ?? 0))),
    price: toPrice(variant.price),
  }));
  const stock = getProductStock({ stock: product.stock, variants });

  return {
    ...product,
    productType,
    stock,
    price: toPrice(product.price)!,
    compareAtPrice: toPrice(product.compareAtPrice),
    variants,
  };
}