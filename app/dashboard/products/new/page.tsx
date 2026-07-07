import { ProductForm } from "@/components/dashboard/product-form";
import { catalogCategoryNames, resolveCatalogSettings } from "@/lib/catalog/settings";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireApprovedForProducts } from "@/lib/auth-server";

export default async function NewProductPage() {
  const { business } = await requireApprovedForProducts();
  const catalog = await resolveCatalogSettings(business.id);

  return (
    <ProductForm
      mode="create"
      currency={business.currency}
      initial={toProductFormInitial()}
      catalogCategories={catalogCategoryNames(catalog)}
      catalogTags={catalog.tags}
    />
  );
}