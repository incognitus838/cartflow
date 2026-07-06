import type { Metadata } from "next";
import { absoluteProductUrl, absoluteStoreUrl } from "@/lib/storefront/paths";

type StoreMeta = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
};

type ProductMeta = {
  id: string;
  title: string;
  description: string | null;
  images: Array<{ url: string; alt: string | null }>;
};

function pickImage(...candidates: Array<string | null | undefined>) {
  return candidates.find((url) => url && url.trim().length > 0) ?? null;
}

export function buildStoreMetadata(store: StoreMeta, productCount?: number): Metadata {
  const title = store.name;
  const description =
    store.description?.trim() ||
    `Shop ${store.name} on CartFlow${productCount ? ` — ${productCount} products available` : ""}.`;
  const url = absoluteStoreUrl(store.slug);
  const image = pickImage(store.logoUrl);

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: store.name,
      ...(image ? { images: [{ url: image, alt: store.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function buildProductMetadata(store: StoreMeta, product: ProductMeta): Metadata {
  const title = `${product.title} | ${store.name}`;
  const description =
    product.description?.trim() ||
    `Order ${product.title} from ${store.name} on CartFlow.`;
  const url = absoluteProductUrl(store.slug, product.id);
  const image = pickImage(product.images[0]?.url, product.images[0]?.alt, store.logoUrl);

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url,
      siteName: store.name,
      ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}