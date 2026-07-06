import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import { toNumber } from "@/lib/decimal";
import { getStoreProduct } from "@/lib/queries/storefront";
import { buildProductMetadata } from "@/lib/storefront/metadata";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type ProductPageProps = {
  params: Promise<{ storeSlug: string; productId: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  const store = await resolveStorefront(storeSlug);
  const product = await getStoreProduct(store.id, productId);

  if (!product) {
    return { title: "Product not found" };
  }

  return buildProductMetadata(store, product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { storeSlug, productId } = await params;
  const store = await resolveStorefront(storeSlug);
  const product = await getStoreProduct(store.id, productId);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetail
      storeSlug={store.slug}
      storeName={store.name}
      currency={store.currency}
      deliveryFee={toNumber(store.deliveryFee)}
      whatsapp={store.whatsapp}
      phone={store.phone}
      product={product}
    />
  );
}