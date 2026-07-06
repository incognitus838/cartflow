import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireBusiness } from "@/lib/auth-server";

export default async function NewProductPage() {
  const { business } = await requireBusiness();

  return (
    <>
      <PageHeader
        title="Add product"
        description={`Create a new item for your ${business.name} storefront.`}
      />
      <ProductForm mode="create" currency={business.currency} initial={toProductFormInitial()} />
    </>
  );
}