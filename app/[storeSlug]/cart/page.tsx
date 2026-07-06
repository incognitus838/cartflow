import { CartPage } from "@/components/storefront/cart-page";
import { toNumber } from "@/lib/decimal";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type CartRouteProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function CartRoute({ params }: CartRouteProps) {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);

  return (
    <CartPage
      storeSlug={store.slug}
      currency={store.currency}
      deliveryFee={toNumber(store.deliveryFee)}
    />
  );
}