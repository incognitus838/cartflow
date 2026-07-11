"use client";

import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { useCart } from "@/components/storefront/cart-provider";
import { useCartDrawer } from "@/components/storefront/cart-drawer-provider";
import { DeliveryZonePicker } from "@/components/storefront/delivery-zone-picker";
import { useDeliveryFee } from "@/lib/delivery/use-delivery-fee";
import { cartPath, checkoutPath } from "@/lib/storefront/paths";
import { formatCurrency } from "@/lib/utils";

type CartDrawerProps = {
  storeSlug: string;
  currency: string;
  fallbackDeliveryFee: number;
};

export function CartDrawer({ storeSlug, currency, fallbackDeliveryFee }: CartDrawerProps) {
  const { open, closeDrawer } = useCartDrawer();
  const {
    lines,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    selectedDeliveryZoneId,
    setSelectedDeliveryZoneId,
  } = useCart();

  const { zones, needsDelivery, effectiveFee, requiresZoneSelection, hasZones } = useDeliveryFee({
    storeSlug,
    lines,
    fallbackDeliveryFee,
    selectedZoneId: selectedDeliveryZoneId,
    onSelectZone: setSelectedDeliveryZoneId,
  });

  if (!open) return null;

  const total = subtotal + (needsDelivery ? effectiveFee : 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity"
        aria-label="Close bag"
        onClick={closeDrawer}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-black/[0.06] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">Your bag</h2>
            <p className="mt-0.5 text-[13px] text-[#86868b]">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full p-2 text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-black/[0.06] bg-[#fbfbfd] text-[#86868b]">
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p className="mt-5 font-medium text-[#1d1d1f]">Your bag is empty</p>
            <p className="mt-1 text-[14px] text-[#86868b]">Tap + on any piece to add it here.</p>
            <button
              type="button"
              onClick={closeDrawer}
              className="btn-primary mt-8 px-6 py-2.5 text-[14px]"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.key}
                    line={line}
                    currency={currency}
                    onUpdateQuantity={(quantity) => updateQuantity(line.key, quantity)}
                    onRemove={() => removeItem(line.key)}
                  />
                ))}
              </ul>

              {needsDelivery && hasZones ? (
                <div className="mt-4">
                  <DeliveryZonePicker
                    zones={zones}
                    currency={currency}
                    selectedZoneId={selectedDeliveryZoneId}
                    onSelect={setSelectedDeliveryZoneId}
                    required
                    compact
                  />
                </div>
              ) : null}
            </div>

            <div className="border-t border-black/[0.06] bg-[#fbfbfd] px-6 py-5">
              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between text-[#6e6e73]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                </div>
                {needsDelivery ? (
                  <div className="flex justify-between text-[#6e6e73]">
                    <span>Delivery</span>
                    <span className="tabular-nums">
                      {effectiveFee > 0 ? formatCurrency(effectiveFee, currency) : "Free"}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-black/[0.06] pt-3 text-[15px] font-semibold text-[#1d1d1f]">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {requiresZoneSelection ? (
                  <button
                    type="button"
                    disabled
                    className="btn-primary cursor-not-allowed py-3 text-center text-[14px] opacity-50"
                  >
                    Choose delivery location
                  </button>
                ) : (
                  <Link
                    href={checkoutPath(storeSlug)}
                    onClick={closeDrawer}
                    className="btn-primary py-3 text-center text-[14px]"
                  >
                    Checkout
                  </Link>
                )}
                <Link
                  href={cartPath(storeSlug)}
                  onClick={closeDrawer}
                  className="btn-secondary py-3 text-center text-[14px]"
                >
                  View full bag
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}