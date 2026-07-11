import { revalidateTag } from "next/cache";

/** Bust storefront catalog cache after product mutations. */
export function revalidateStorefrontCatalog(businessId: string, storeSlug: string) {
  revalidateTag(`catalog-${businessId}`, { expire: 0 });
  revalidateTag(`store-${storeSlug}`, { expire: 0 });
}