import type { StorefrontTheme } from "@prisma/client";

export type DemoHeroProduct = {
  name: string;
  price: string;
  category: string;
  image: string;
  alt: string;
};

export type DemoStoreConfig = {
  slug: string;
  name: string;
  type: string;
  description: string;
  vertical: string;
  theme: StorefrontTheme;
  accentColor: string;
  logoUrl: string;
  heroProducts: DemoHeroProduct[];
};

import {
  DEMO_STORES as DEMO_STORES_RAW,
  DEMO_STORE_SLUGS,
  getDailyDemoStore as getDailyDemoStoreRaw,
  getDayIndexInLagos,
  getDemoStoreBySlug as getDemoStoreBySlugRaw,
} from "./stores.mjs";

export { DEMO_STORE_SLUGS, getDayIndexInLagos };

export const DEMO_STORES = DEMO_STORES_RAW as DemoStoreConfig[];

export function getDailyDemoStore(date = new Date()): DemoStoreConfig {
  return getDailyDemoStoreRaw(date) as DemoStoreConfig;
}

export function getDemoStoreBySlug(slug: string): DemoStoreConfig | null {
  return getDemoStoreBySlugRaw(slug) as DemoStoreConfig | null;
}