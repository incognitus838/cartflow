"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/storefront/cart-provider";

/** Ensures the bag is empty after a successful checkout (belt-and-suspenders). */
export function CartClearOnOrder() {
  const searchParams = useSearchParams();
  const { clear } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("placed") !== "1" || clearedRef.current) return;
    clearedRef.current = true;
    clear();
  }, [clear, searchParams]);

  return null;
}