import { Suspense } from "react";
import { CustomerInsightsPanel } from "@/components/admin/customer-insights-panel";
import { PeriodSelector } from "@/components/admin/period-selector";
import { PageHeader } from "@/components/shared/page-header";
import { getPlatformCustomerInsights, type PeriodDays } from "@/lib/admin/analytics";

function parsePeriod(days?: string): PeriodDays {
  const n = Number(days);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

type AdminCustomersPageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const { days } = await searchParams;
  const periodDays = parsePeriod(days);
  const data = await getPlatformCustomerInsights(periodDays);

  return (
    <>
      <PageHeader
        title="Customer intelligence"
        description="Per-store buyers: repeat rate, LTV, promo sensitivity, and profile completeness. Customers are scoped to each seller's storefront (unique on phone per store)."
        actions={
          <Suspense fallback={null}>
            <PeriodSelector active={periodDays} />
          </Suspense>
        }
        alert={
          <p className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white px-4 py-3 text-[13px] text-[#6e6e73]">
            <span className="font-semibold text-[#1d1d1f]">Privacy note:</span> Customer records
            belong to individual stores. Platform rollups aggregate counts and rates — use store
            context before outreach.
          </p>
        }
      />

      <CustomerInsightsPanel data={data} />
    </>
  );
}