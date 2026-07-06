import type { CartState } from "@/lib/cart/types";

const PREFIX = "cartflow:cart:";

export function cartStorageKey(storeSlug: string) {
  return `${PREFIX}${storeSlug}`;
}

export function readCart(storeSlug: string): CartState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(cartStorageKey(storeSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.storeSlug !== storeSlug || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCart(state: CartState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(state.storeSlug), JSON.stringify(state));
}

export function clearCart(storeSlug: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(cartStorageKey(storeSlug));
}