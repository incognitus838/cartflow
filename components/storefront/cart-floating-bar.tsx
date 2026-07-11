"use client";

import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { useCartDrawer } from "@/components/storefront/cart-drawer-provider";
import { formatCurrency } from "@/lib/utils";

type CartFloatingBarProps = {
  currency: string;
};

export function CartFloatingBar({ currency }: CartFloatingBarProps) {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();
  const { open, openDrawer } = useCartDrawer();

  const hideBar =
    pathname.endsWith("/cart") ||
    pathname.endsWith("/checkout") ||
    pathname.includes("/order/") ||
    pathname.includes("/products/");

  if (itemCount === 0 || open || hideBar) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <button
        type="button"
        onClick={openDrawer}
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-black/[0.08] bg-[#1d1d1f] py-2.5 pl-3 pr-5 text-[13px] font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.25)] active:scale-[0.98]"
        aria-label={`View bag with ${itemCount} items`}
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b8956a] px-1 text-[9px] font-bold">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </span>
        <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
        <span className="text-white/50">·</span>
        <span>View bag</span>
      </button>
    </div>
  );
}