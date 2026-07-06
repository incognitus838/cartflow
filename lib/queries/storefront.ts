import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { serializeStoreProduct } from "@/lib/storefront/serialize-product";

const STORE_REVALIDATE = 120;
const CATALOG_REVALIDATE = 60;

function cachedQuery<T>(
  fn: () => Promise<T>,
  key: string[],
  options: { revalidate: number; tags: string[] },
): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    return fn();
  }
  return unstable_cache(fn, key, options)();
}

async function fetchStorefrontBySlug(slug: string) {
  return prisma.business.findFirst({
    where: { slug, isActive: true, approvalStatus: "APPROVED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      currency: true,
      deliveryFee: true,
      phone: true,
      whatsapp: true,
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      storefrontTheme: true,
      accentColor: true,
      heroTagline: true,
      welcomeMessage: true,
      showContactButton: true,
      catalogLayout: true,
    },
  });
}

export const getStorefrontBySlug = cache((slug: string) =>
  cachedQuery(() => fetchStorefrontBySlug(slug), [`store-${slug}`], {
    revalidate: STORE_REVALIDATE,
    tags: [`store-${slug}`],
  }),
);

async function fetchActiveProductsForStore(businessId: string) {
  const products = await prisma.product.findMany({
    where: { businessId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return products.map(serializeStoreProduct);
}

export const getActiveProductsForStore = cache((businessId: string) =>
  cachedQuery(
    () => fetchActiveProductsForStore(businessId),
    [`catalog-${businessId}`],
    { revalidate: CATALOG_REVALIDATE, tags: [`catalog-${businessId}`] },
  ),
);

export const getActiveProductCount = cache((businessId: string) =>
  cachedQuery(
    () => prisma.product.count({ where: { businessId, status: "ACTIVE" } }),
    [`catalog-count-${businessId}`],
    { revalidate: CATALOG_REVALIDATE, tags: [`catalog-${businessId}`] },
  ),
);

async function fetchStoreProduct(businessId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, businessId, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, alt: true, mediaType: true },
      },
      variants: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
        },
      },
    },
  });

  return product ? serializeStoreProduct(product) : null;
}

export const getStoreProduct = cache((businessId: string, productId: string) =>
  cachedQuery(
    () => fetchStoreProduct(businessId, productId),
    [`product-${businessId}-${productId}`],
    { revalidate: CATALOG_REVALIDATE, tags: [`catalog-${businessId}`] },
  ),
);

export async function getStoreOrder(businessId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { businessId, orderNumber },
    include: { items: true },
  });
}