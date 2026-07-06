import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { toProductFormInitial } from "@/lib/products/form-initial";
import { requireBusiness } from "@/lib/auth-server";
import { getBusinessProduct } from "@/lib/queries/dashboard";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { business } = await requireBusiness();
  const { id } = await params;
  const product = await getBusinessProduct(business.id, id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Edit product" description={product.title} />
      <ProductForm
        mode="edit"
        currency={business.currency}
        initial={toProductFormInitial(product)}
      />
    </>
  );
}