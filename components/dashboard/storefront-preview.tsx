"use client";

import { CartProvider } from "@/components/storefront/cart-provider";
import { StoreCatalog } from "@/components/storefront/store-catalog";
import { StoreHeader } from "@/components/storefront/store-header";
import { StorefrontThemeShell } from "@/components/storefront/storefront-theme-shell";
import type { StorefrontCustomizerStore } from "@/components/dashboard/storefront-customizer";
import type { StorefrontProfile } from "@/lib/business/storefront-profile-shared";
import type { StorefrontProductCard } from "@/components/storefront/product-card";
import { getPublicStoreHost } from "@/lib/storefront/paths";

type StorefrontPreviewDraft = {
  profile: StorefrontProfile;
  store: StorefrontCustomizerStore;
  products: StorefrontProductCard[];
  catalogTotalCount: number;
};

type StorefrontPreviewProps = {
  draft: StorefrontPreviewDraft;
  viewport?: "mobile" | "desktop";
};

export function StorefrontPreview({ draft, viewport = "desktop" }: StorefrontPreviewProps) {
  const { profile, store, products, catalogTotalCount } = draft;
  const headerSubtitle = profile.heroTagline ?? store.description;
  const isMobile = viewport === "mobile";

  return (
    <div className="cf-storefront-device">
      <div className="cf-storefront-device-chrome">
        <span className="cf-storefront-device-dot" aria-hidden />
        <span className="cf-storefront-device-dot" aria-hidden />
        <span className="cf-storefront-device-dot" aria-hidden />
        <p className="mx-auto truncate text-center text-[11px] font-medium text-[#86868b]">
          {getPublicStoreHost()}/{store.slug}
        </p>
      </div>

      <div
        className={`cf-storefront-device-screen overflow-hidden bg-[#e8e8ed] ${
          isMobile ? "max-w-[390px] mx-auto" : ""
        }`}
      >
        <div className={isMobile ? "h-[min(70vh,640px)] overflow-y-auto" : "max-h-[min(72vh,720px)] overflow-y-auto"}>
          <CartProvider storeSlug={store.slug}>
            <StorefrontThemeShell profile={profile}>
              <StoreHeader
                name={store.name}
                slug={store.slug}
                description={headerSubtitle}
                logoUrl={store.logoUrl}
                whatsapp={store.whatsapp}
                phone={store.phone}
                showContactButton={profile.showContactButton}
                previewMode
              />
              <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
                {products.length === 0 ? (
                  <div className="rounded-[var(--cf-radius-lg)] border border-[var(--store-border)] bg-[var(--store-surface)] px-6 py-16 text-center">
                    <p className="text-[15px] font-medium text-[var(--store-text)]">No products yet</p>
                    <p className="mt-2 text-[13px] text-[var(--store-muted)]">
                      Add products to see them in your customer preview.
                    </p>
                  </div>
                ) : (
                  <StoreCatalog
                    storeSlug={store.slug}
                    storeName={store.name}
                    description={headerSubtitle}
                    welcomeMessage={profile.welcomeMessage}
                    catalogLayout={profile.catalogLayout}
                    currency={store.currency}
                    products={products}
                    catalogTotalCount={catalogTotalCount}
                    previewMode
                  />
                )}
              </div>
            </StorefrontThemeShell>
          </CartProvider>
        </div>
      </div>
    </div>
  );
}