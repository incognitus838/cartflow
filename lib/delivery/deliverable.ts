import type { ProductType } from "@/lib/products/product-types";

const DELIVERABLE_TYPES = new Set<ProductType>(["PHYSICAL", "FOOD"]);

export function isDeliverableProductType(productType: ProductType | string | undefined) {
  return productType != null && DELIVERABLE_TYPES.has(productType as ProductType);
}

export function cartNeedsDelivery(
  lines: Array<{ productType?: ProductType | string }>,
): boolean {
  return lines.some((line) => isDeliverableProductType(line.productType));
}