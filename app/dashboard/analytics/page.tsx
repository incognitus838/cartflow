import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { requireLivePermission } from "@/lib/auth-server";
import { getBusinessAnalytics } from "@/lib/analytics/business";
import { hasAnalytics } from "@/lib/plans";

export default async function AnalyticsPage() {
  const { business } = await requireLivePermission("analytics");

  if (!hasAnalytics(business.plan)) {
    return (
      <>
        <PageHeader title="Analytics" description="Revenue charts and order breakdowns on Starter and above." />
        <div className="flex flex-col items-center justify-center rounded-[var(--cf-radius-lg)] border border-dashed border-black/[0.1] bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--cf-radius-md)] bg-[#f5f5f7] text-[#b8956a]">
            <BarChart3 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
            Analytics on Starter+
          </h2>
          <p className="mt-2 max-w-sm text-[13px] text-[#86868b]">
            Upgrade to Starter or higher to unlock revenue charts, top products, and order breakdowns.
          </p>
          <Link href="/dashboard/billing" className="btn-primary mt-6">
            View plans
          </Link>
        </div>
      </>
    );
  }

  const analytics = await getBusinessAnalytics(business.id);

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Last ${analytics.periodDays} days performance.`}
      />
      <AnalyticsDashboard analytics={analytics} currency={business.currency} />
    </>
  );
}