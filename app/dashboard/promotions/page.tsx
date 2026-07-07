import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PromotionsList } from "@/components/dashboard/promotions-list";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { listBusinessPromotions } from "@/lib/queries/dashboard";

export default async function PromotionsPage() {
  const { business, storeAccessRole } = await requireBusiness();
  const promotions = await listBusinessPromotions(business.id);

  return (
    <>
      <PageHeader
        title="Promotions"
        description="Create discount codes and free-gift giveaways. Share codes on WhatsApp or Instagram — customers apply them at checkout."
        actions={
          <Link href="/dashboard/promotions/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            New offer
          </Link>
        }
      />

      <section aria-labelledby="promo-types" className="mb-6 grid gap-4 sm:grid-cols-3">
        <h2 id="promo-types" className="sr-only">
          Promotion types
        </h2>
        <article className="cf-stat-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Discount codes</p>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            % off or fixed amount — share unique codes per campaign.
          </p>
        </article>
        <article className="cf-stat-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Giveaways</p>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            Free gift when order hits a minimum — great for loyalty.
          </p>
        </article>
        <article className="cf-stat-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Sale prices</p>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            Set compare-at prices on products for always-on storefront sales.
          </p>
          <Link
            href="/dashboard/products"
            className="mt-2 inline-block text-[12px] font-medium text-[#b8956a] hover:underline"
          >
            Manage products →
          </Link>
        </article>
      </section>

      {promotions.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No promotions yet"
          description="Create your first discount code or free-gift offer to boost orders from your store link."
          actionLabel="Create offer"
          actionHref="/dashboard/promotions/new"
        />
      ) : (
        <PromotionsList
          currency={business.currency}
          canDelete={storeAccessRole === "owner"}
          promotions={promotions.map((promotion) => ({
            ...promotion,
            startsAt: promotion.startsAt?.toISOString() ?? null,
            endsAt: promotion.endsAt?.toISOString() ?? null,
          }))}
        />
      )}
    </>
  );
}