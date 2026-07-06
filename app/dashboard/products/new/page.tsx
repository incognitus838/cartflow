import { ProductForm } from "@/components/dashboard/product-form";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireBusiness } from "@/lib/auth-server";

export default async function NewProductPage() {
  const { business } = await requireBusiness();

  return (
    <ProductForm mode="create" currency={business.currency} initial={toProductFormInitial()} />
  );
}