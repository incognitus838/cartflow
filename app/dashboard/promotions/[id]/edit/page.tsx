import { notFound } from "next/navigation";
import { PromotionForm } from "@/components/dashboard/promotion-form";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";
import { getBusinessPromotion, listBusinessProducts } from "@/lib/queries/dashboard";

type EditPromotionPageProps = {
  params: Promise<{ id: string }>;
};

function toLocalInput(value: Date | null) {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const { business } = await requireBusiness();
  const { id } = await params;
  const [promotion, products] = await Promise.all([
    getBusinessPromotion(business.id, id),
    listBusinessProducts(business.id, { status: "ACTIVE" }),
  ]);

  if (!promotion) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit promotion"
        description={`${promotion.usedCount} use${promotion.usedCount === 1 ? "" : "s"} so far${
          promotion._count.orders > 0 ? ` · ${promotion._count.orders} orders` : ""
        }`}
      />

      <PromotionForm
        mode="edit"
        currency={business.currency}
        products={products.map((p) => ({ id: p.id, title: p.title }))}
        initial={{
          id: promotion.id,
          title: promotion.title,
          code: promotion.code,
          type: promotion.type,
          value: promotion.value != null ? String(toNumber(promotion.value)) : "",
          minOrderAmount:
            promotion.minOrderAmount != null ? String(toNumber(promotion.minOrderAmount)) : "",
          maxUses: promotion.maxUses != null ? String(promotion.maxUses) : "",
          giftProductId: promotion.giftProductId ?? "",
          startsAt: toLocalInput(promotion.startsAt),
          endsAt: toLocalInput(promotion.endsAt),
          isActive: promotion.isActive,
        }}
      />
    </>
  );
}