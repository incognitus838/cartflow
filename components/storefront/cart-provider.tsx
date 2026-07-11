"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AddToCartInput, CartLine } from "@/lib/cart/types";
import { cartLineKey } from "@/lib/cart/types";
import { clearCart, persistEmptyCart, readCart, writeCart } from "@/lib/cart/storage";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  storeSlug: string;
  children: React.ReactNode;
};

export function CartProvider({ storeSlug, children }: CartProviderProps) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const linesRef = useRef<CartLine[]>([]);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    const saved = readCart(storeSlug);
    const next = saved?.lines ?? [];
    linesRef.current = next;
    setLines(next);
    setHydrated(true);
  }, [storeSlug]);

  useEffect(() => {
    if (!hydrated) return;

    if (lines.length === 0) {
      clearCart(storeSlug);
      return;
    }

    writeCart({ storeSlug, lines, updatedAt: Date.now() });
  }, [hydrated, lines, storeSlug]);

  useEffect(() => {
    function resyncFromStorage() {
      const saved = readCart(storeSlug);
      const next = saved?.lines ?? [];
      linesRef.current = next;
      setLines(next);
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) resyncFromStorage();
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [storeSlug]);

  const addItem = useCallback((input: AddToCartInput) => {
    const key = cartLineKey(input.productId, input.variantId);

    setLines((current) => {
      const existing = current.find((line) => line.key === key);

      if (existing) {
        const quantity = Math.min(existing.quantity + input.quantity, input.maxStock);
        return current.map((line) =>
          line.key === key ? { ...line, quantity, maxStock: input.maxStock } : line,
        );
      }

      return [
        ...current,
        {
          key,
          productId: input.productId,
          variantId: input.variantId,
          title: input.title,
          variantName: input.variantName,
          sku: input.sku,
          imageUrl: input.imageUrl,
          unitPrice: input.unitPrice,
          quantity: Math.min(input.quantity, input.maxStock),
          maxStock: input.maxStock,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current
        .map((line) =>
          line.key === key
            ? { ...line, quantity: Math.max(1, Math.min(quantity, line.maxStock)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => {
    persistEmptyCart(storeSlug);
    linesRef.current = [];
    setLines([]);
  }, [storeSlug]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

    return {
      lines,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [addItem, clear, lines, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}