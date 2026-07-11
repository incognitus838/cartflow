import { revalidateTag } from "next/cache";

/** Bust cached storefront profile (bank, contact, branding) after settings change. */
export function revalidateStorefrontCache(...slugs: string[]) {
  for (const slug of slugs) {
    if (slug) revalidateTag(`store-${slug}`, { expire: 0 });
  }
}