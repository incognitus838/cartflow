import { toNumber } from "@/lib/decimal";

type Decimalish = { toString(): string } | number | string | null | undefined;

function toPrice(value: Decimalish) {
  if (value == null) return null;
  return toNumber(value);
}

export function serializeStoreProduct<
  T extends {
    price: Decimalish;
    compareAtPrice?: Decimalish;
    variants: Array<{ price?: Decimalish }>;
  },
>(product: T) {
  return {
    ...product,
    price: toPrice(product.price)!,
    compareAtPrice: toPrice(product.compareAtPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: toPrice(variant.price),
    })),
  };
}