"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { useCartDrawer } from "@/components/storefront/cart-drawer-provider";

type CartNavLinkProps = {
  storeSlug: string;
};

export function CartNavLink({ storeSlug }: CartNavLinkProps) {
  const { itemCount } = useCart();
  const { openDrawer } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative inline-flex shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white p-2.5 text-[#1d1d1f] transition-all hover:border-black/[0.14] hover:shadow-sm"
      aria-label={`Bag with ${itemCount} items`}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      {itemCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1d1d1f] px-1 text-[10px] font-semibold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}