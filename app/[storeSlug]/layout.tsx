import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartDrawerProvider } from "@/components/storefront/cart-drawer-provider";
import { CartFloatingBar } from "@/components/storefront/cart-floating-bar";
import { CartProvider } from "@/components/storefront/cart-provider";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreHeader } from "@/components/storefront/store-header";
import { StorefrontThemeShell } from "@/components/storefront/storefront-theme-shell";
import { toStorefrontProfile } from "@/lib/business/storefront-profile";
import { toNumber } from "@/lib/decimal";

import { resolveStorefront } from "@/lib/storefront/resolve-store";

type StoreLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export const revalidate = 60;

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);
  const profile = toStorefrontProfile(store);
  const headerSubtitle = profile.heroTagline ?? store.description;
  return (
    <CartProvider storeSlug={store.slug}>
      <CartDrawerProvider>
        <StorefrontThemeShell profile={profile} className="min-h-screen">
          <StoreHeader
            name={store.name}
            slug={store.slug}
            description={headerSubtitle}
            logoUrl={store.logoUrl}
            whatsapp={store.whatsapp}
            phone={store.phone}
            showContactButton={profile.showContactButton}
          />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <StoreFooter storeName={store.name} />
          <CartFloatingBar currency={store.currency} />
          <CartDrawer
            storeSlug={store.slug}
            currency={store.currency}
            fallbackDeliveryFee={toNumber(store.deliveryFee)}
          />
        </StorefrontThemeShell>
      </CartDrawerProvider>
    </CartProvider>
  );
}