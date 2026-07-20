import { categoryHeroImage } from "../catalog/demo-images.mjs";
import { productImageUrl } from "../catalog/product-image-catalog.mjs";

/** @typedef {{ slug: string; name: string; type: string; description: string; vertical: string; theme: string; accentColor: string; logoUrl: string; heroProducts: { name: string; price: string; category: string; image: string; alt: string }[] }} DemoStoreConfig */

/** The only public demo storefront. */
/** @type {DemoStoreConfig} */
export const GLOW_BEAUTY_DEMO = {
  slug: "glow-beauty",
  name: "Glow Beauty",
  type: "Beauty & personal care",
  description:
    "Premium makeup, skincare, fragrance, and bath essentials — curated for everyday glow.",
  vertical: "beauty",
  theme: "CLASSIC",
  accentColor: "#b8956a",
  logoUrl: categoryHeroImage("beauty", "skincare"),
  heroProducts: [
    {
      name: "Oud Lagos Serum",
      price: "₦12,500",
      category: "Skincare",
      image: "/landing/oud-lagos-serum.png",
      alt: "Oud Lagos Serum dropper bottle",
    },
    {
      name: "Oud Lagos Eau de Parfum",
      price: "₦28,000",
      category: "Fragrance",
      image: "/landing/oud-lagos-eau-de-parfum.png",
      alt: "Oud Lagos Eau de Parfum bottle",
    },
    {
      name: "Velvet Kiss Lip Oil",
      price: "₦4,800",
      category: "Lip Care",
      image: productImageUrl("beauty", "lip-care", 0),
      alt: "Lip care product flat lay",
    },
  ],
};

/** @type {DemoStoreConfig[]} */
export const DEMO_STORES = [GLOW_BEAUTY_DEMO];

export const DEMO_STORE_SLUGS = DEMO_STORES.map((store) => store.slug);

/** Always returns Glow Beauty (single demo store). */
export function getDemoStore() {
  return GLOW_BEAUTY_DEMO;
}

/** @deprecated Use getDemoStore() */
export function getDailyDemoStore(_date = new Date()) {
  return getDemoStore();
}

export function getDemoStoreBySlug(slug) {
  return DEMO_STORES.find((store) => store.slug === slug) ?? null;
}
