import { CheckoutPage } from "@/components/storefront/checkout-page";
import { toNumber } from "@/lib/decimal";
import { resolveManualPaymentAccount } from "@/lib/payments/manual";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type CheckoutRouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);
  return (
    <CheckoutPage
      storeSlug={store.slug}
      currency={store.currency}
      fallbackDeliveryFee={toNumber(store.deliveryFee)}
      paymentAccount={resolveManualPaymentAccount(store)}
    />
  );
}