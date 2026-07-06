import type { Metadata } from "next";
import { StoreCatalog } from "@/components/storefront/store-catalog";
import { toStorefrontProfile } from "@/lib/business/storefront-profile";
import { getActiveProductCount, getActiveProductsForStore } from "@/lib/queries/storefront";
import { buildStoreMetadata } from "@/lib/storefront/metadata";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);
  const productCount = await getActiveProductCount(store.id);
  return buildStoreMetadata(store, productCount);
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const store = await resolveStorefront(storeSlug);
  const profile = toStorefrontProfile(store);
  const products = await getActiveProductsForStore(store.id);
  const heroCopy = profile.heroTagline ?? store.description;

  return (
    <StoreCatalog
      storeSlug={store.slug}
      storeName={store.name}
      description={heroCopy}
      welcomeMessage={profile.welcomeMessage}
      catalogLayout={profile.catalogLayout}
      currency={store.currency}
      products={products}
    />
  );
}