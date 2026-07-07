import { redirect } from "next/navigation";
import { AddProductFlow } from "@/components/dashboard/add-product-flow";
import { canManageProducts, isPendingApproval } from "@/lib/business/approval";
import { requireProductsHub } from "@/lib/auth-server";
import { resolveCatalogSettings } from "@/lib/catalog/settings";

export default async function NewProductPage() {
  const { business, permissions } = await requireProductsHub();
  const catalog = await resolveCatalogSettings(business.id);
  const productsUnlocked = canManageProducts(business) && permissions.products;
  const storePending = isPendingApproval(business);

  if (!permissions.catalog && !permissions.products) {
    redirect("/dashboard");
  }

  return (
    <AddProductFlow
      currency={business.currency}
      initialCatalog={catalog}
      productsUnlocked={productsUnlocked}
      storePending={storePending}
      canCatalog={permissions.catalog}
    />
  );
}