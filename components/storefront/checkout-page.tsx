"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { useCart } from "@/components/storefront/cart-provider";
import { DeliveryZonePicker } from "@/components/storefront/delivery-zone-picker";
import { OrderSummary } from "@/components/storefront/order-summary";
import { PromoCodeInput, type AppliedPromo } from "@/components/storefront/promo-code-input";
import { useDeliveryFee } from "@/lib/delivery/use-delivery-fee";
import type { ManualPaymentAccount } from "@/lib/payments/manual";
import { cartPath, storePath } from "@/lib/storefront/paths";

type CheckoutPageProps = {
  storeSlug: string;
  currency: string;
  fallbackDeliveryFee: number;
  paymentAccount: ManualPaymentAccount | null;
};

export function CheckoutPage({
  storeSlug,
  currency,
  fallbackDeliveryFee,
  paymentAccount,
}: CheckoutPageProps) {
  const router = useRouter();
  const { lines, selectedDeliveryZoneId, setSelectedDeliveryZoneId } = useCart();
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const {
    zones,
    needsDelivery,
    effectiveFee,
    selectedZoneName,
    requiresZoneSelection,
    hasZones,
  } = useDeliveryFee({
    storeSlug,
    lines,
    fallbackDeliveryFee,
    selectedZoneId: selectedDeliveryZoneId,
  });

  useEffect(() => {
    if (placingOrder) return;
    if (lines.length === 0) {
      router.replace(cartPath(storeSlug));
    }
  }, [lines.length, placingOrder, router, storeSlug]);

  if (!placingOrder && lines.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">Complete your order — no account required.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="space-y-6">
          {needsDelivery && hasZones ? (
            <DeliveryZonePicker
              zones={zones}
              currency={currency}
              selectedZoneId={selectedDeliveryZoneId}
              onSelect={setSelectedDeliveryZoneId}
              required
            />
          ) : null}

          <PromoCodeInput
            storeSlug={storeSlug}
            lines={lines}
            currency={currency}
            applied={appliedPromo}
            onApplied={setAppliedPromo}
          />
          <CheckoutForm
            storeSlug={storeSlug}
            lines={lines}
            currency={currency}
            deliveryFee={effectiveFee}
            deliveryZoneId={selectedDeliveryZoneId}
            requiresZoneSelection={requiresZoneSelection}
            paymentAccount={paymentAccount}
            appliedPromo={appliedPromo}
            onPlacingChange={setPlacingOrder}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            lines={lines}
            currency={currency}
            deliveryFee={effectiveFee}
            deliveryZoneName={selectedZoneName}
            showDelivery={needsDelivery}
            discountAmount={appliedPromo?.discountAmount ?? 0}
            giftTitle={appliedPromo?.giftLine?.title}
            compact
          />
          <Link
            href={storePath(storeSlug)}
            className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}