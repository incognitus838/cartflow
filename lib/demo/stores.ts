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
  GLOW_BEAUTY_DEMO as GLOW_BEAUTY_DEMO_RAW,
  getDemoStore as getDemoStoreRaw,
  getDailyDemoStore as getDailyDemoStoreRaw,
  getDemoStoreBySlug as getDemoStoreBySlugRaw,
} from "./stores.mjs";

export { DEMO_STORE_SLUGS };

export const DEMO_STORES = DEMO_STORES_RAW as DemoStoreConfig[];
export const GLOW_BEAUTY_DEMO = GLOW_BEAUTY_DEMO_RAW as DemoStoreConfig;

/** The single public demo storefront (Glow Beauty). */
export function getDemoStore(): DemoStoreConfig {
  return getDemoStoreRaw() as DemoStoreConfig;
}

/** @deprecated Use getDemoStore() */
export function getDailyDemoStore(_date = new Date()): DemoStoreConfig {
  return getDailyDemoStoreRaw(_date) as DemoStoreConfig;
}

export function getDemoStoreBySlug(slug: string): DemoStoreConfig | null {
  return getDemoStoreBySlugRaw(slug) as DemoStoreConfig | null;
}
