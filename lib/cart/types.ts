import type { ProductType } from "@/lib/products/product-types";

export type CartLine = {
  key: string;
  productId: string;
  variantId?: string;
  title: string;
  variantName?: string;
  sku?: string;
  imageUrl?: string;
  productType?: ProductType;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export type CartState = {
  storeSlug: string;
  lines: CartLine[];
  selectedDeliveryZoneId?: string | null;
  updatedAt: number;
};

export type AddToCartInput = {
  productId: string;
  variantId?: string;
  title: string;
  variantName?: string;
  sku?: string;
  imageUrl?: string;
  productType?: ProductType;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export function cartLineKey(productId: string, variantId?: string) {
  return `${productId}:${variantId ?? "base"}`;
}