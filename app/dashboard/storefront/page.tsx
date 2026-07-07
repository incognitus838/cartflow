import { StorefrontCustomizer } from "@/components/dashboard/storefront-customizer";
import { PageHeader } from "@/components/shared/page-header";
import { toStorefrontProfile } from "@/lib/business/storefront-profile";
import { requirePermission } from "@/lib/auth-server";
import {
  countActiveBusinessProducts,
  listStorefrontPreviewProducts,
} from "@/lib/queries/dashboard";
import { serializeStoreProduct } from "@/lib/storefront/serialize-product";

export default async function StorefrontPage() {
  const { business } = await requirePermission("storefront");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const [previewProducts, catalogTotalCount] = await Promise.all([
    listStorefrontPreviewProducts(business.id),
    countActiveBusinessProducts(business.id),
  ]);

  const activeProducts = previewProducts.map((p) =>
    serializeStoreProduct({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      images: p.images,
      variants: p.variants,
    }),
  );

  const profile = toStorefrontProfile(business);

  return (
    <>
      <PageHeader
        title="Storefront"
        description="Design how customers experience your store — theme, messaging, and layout update in real time."
      />

      <StorefrontCustomizer
        initialProfile={profile}
        appUrl={appUrl}
        catalogTotalCount={catalogTotalCount}
        store={{
          name: business.name,
          slug: business.slug,
          description: business.description,
          logoUrl: business.logoUrl,
          phone: business.phone,
          whatsapp: business.whatsapp,
          currency: business.currency,
        }}
        products={activeProducts}
      />
    </>
  );
}