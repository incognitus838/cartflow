import { toNumber } from "@/lib/decimal";
import { parseProductMetadata } from "@/lib/products/metadata";
import type { ProductType } from "@/lib/products/product-types";

type Decimalish = { toString(): string } | number | string | null | undefined;

function toPrice(value: Decimalish) {
  if (value == null) return null;
  return toNumber(value);
}

export function serializeStoreProduct<
  T extends {
    price: Decimalish;
    compareAtPrice?: Decimalish;
    metadata?: unknown;
    variants: Array<{ price?: Decimalish }>;
  },
>(product: T) {
  const productType: ProductType = parseProductMetadata(product.metadata).productType;

  return {
    ...product,
    productType,
    price: toPrice(product.price)!,
    compareAtPrice: toPrice(product.compareAtPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: toPrice(variant.price),
    })),
  };
}