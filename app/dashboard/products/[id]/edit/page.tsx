import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { catalogCategoryNames, resolveCatalogSettings } from "@/lib/catalog/settings";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireBusiness } from "@/lib/auth-server";
import { getBusinessProduct } from "@/lib/queries/dashboard";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { business } = await requireBusiness();
  const { id } = await params;
  const [product, catalog] = await Promise.all([
    getBusinessProduct(business.id, id),
    resolveCatalogSettings(business.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      currency={business.currency}
      initial={toProductFormInitial(product)}
      catalogCategories={catalogCategoryNames(catalog)}
      catalogTags={catalog.tags}
    />
  );
}