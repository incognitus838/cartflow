"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { useCart } from "@/components/storefront/cart-provider";
import { OrderSummary } from "@/components/storefront/order-summary";
import { checkoutPath, storePath } from "@/lib/storefront/paths";

type CartPageProps = {
  storeSlug: string;
  currency: string;
  deliveryFee: number;
};

export function CartPage({ storeSlug, currency, deliveryFee }: CartPageProps) {
  const { lines, updateQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Browse products and add items to checkout as a guest.
        </p>
        <Link href={storePath(storeSlug)} className="btn-primary mt-6">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Your cart</h1>
        <p className="mt-1 text-sm text-slate-600">{lines.length} item{lines.length === 1 ? "" : "s"}</p>

        <div className="mt-5 space-y-3">
          {lines.map((line) => (
            <CartLineItem
              key={line.key}
              line={line}
              currency={currency}
              onUpdateQuantity={(quantity) => updateQuantity(line.key, quantity)}
              onRemove={() => removeItem(line.key)}
            />
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary lines={lines} currency={currency} deliveryFee={deliveryFee} />
        <Link href={checkoutPath(storeSlug)} className="btn-primary mt-4 block w-full py-3 text-center">
          Proceed to checkout
        </Link>
        <Link
          href={storePath(storeSlug)}
          className="mt-3 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}