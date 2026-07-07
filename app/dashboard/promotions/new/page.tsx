import { PromotionForm } from "@/components/dashboard/promotion-form";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth-server";
import { listBusinessProducts } from "@/lib/queries/dashboard";

export default async function NewPromotionPage() {
  const { business } = await requirePermission("promotions");
  const products = await listBusinessProducts(business.id, { status: "ACTIVE" });

  return (
    <>
      <PageHeader
        title="New promotion"
        description="Set up a discount code or giveaway for your storefront."
      />
      <PromotionForm
        mode="create"
        currency={business.currency}
        products={products.map((p) => ({ id: p.id, title: p.title }))}
        initial={{
          title: "",
          code: "",
          type: "PERCENT_OFF",
          value: "",
          minOrderAmount: "",
          maxUses: "",
          giftProductId: "",
          startsAt: "",
          endsAt: "",
          isActive: true,
        }}
      />
    </>
  );
}