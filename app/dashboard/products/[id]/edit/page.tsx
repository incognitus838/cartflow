import { notFound } from "next/navigation";
import { EditProductFlow } from "@/components/dashboard/edit-product-flow";
import { resolveCatalogSettings } from "@/lib/catalog/settings";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireApprovedForProducts } from "@/lib/auth-server";
import { getBusinessProduct } from "@/lib/queries/dashboard";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { business, permissions } = await requireApprovedForProducts();
  const { id } = await params;

  const [product, catalog] = await Promise.all([
    getBusinessProduct(business.id, id),
    resolveCatalogSettings(business.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <EditProductFlow
      currency={business.currency}
      initialCatalog={catalog}
      productInitial={toProductFormInitial(product)}
      canCatalog={permissions.catalog}
    />
  );
}