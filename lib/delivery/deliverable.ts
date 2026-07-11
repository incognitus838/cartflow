import type { ProductType } from "@/lib/products/product-types";

const DELIVERABLE_TYPES = new Set<ProductType>(["ONLINE", "PHYSICAL", "FOOD"]);

export function isDeliverableProductType(productType: ProductType | string | undefined) {
  const type = productType ?? "PHYSICAL";
  return DELIVERABLE_TYPES.has(type as ProductType);
}

export function cartNeedsDelivery(
  lines: Array<{ productType?: ProductType | string }>,
): boolean {
  if (lines.length === 0) return false;
  return lines.some((line) => isDeliverableProductType(line.productType));
}