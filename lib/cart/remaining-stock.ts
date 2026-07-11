import type { CartLine } from "@/lib/cart/types";
import { cartLineKey } from "@/lib/cart/types";

export function quantityInCart(
  lines: CartLine[],
  productId: string,
  variantId?: string,
): number {
  const key = cartLineKey(productId, variantId);
  return lines.find((line) => line.key === key)?.quantity ?? 0;
}

export function remainingStock(totalStock: number, inCart: number): number {
  return Math.max(0, totalStock - inCart);
}