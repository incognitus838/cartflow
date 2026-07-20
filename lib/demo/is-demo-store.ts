import { DEMO_STORE_SLUGS, isDemoStoreSlug as isDemo } from "@/lib/catalog/demo-bank.mjs";

export { DEMO_STORE_SLUGS };

export function isDemoStoreSlug(slug: string): boolean {
  return isDemo(slug);
}
