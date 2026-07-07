import { Suspense } from "react";
import { MetricGlossary } from "@/components/admin/metric-glossary";
import { PeriodSelector } from "@/components/admin/period-selector";
import { PlatformAnalyticsPanel } from "@/components/admin/platform-analytics-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getPlatformAnalytics, type PeriodDays } from "@/lib/admin/analytics";

function parsePeriod(days?: string): PeriodDays {
  const n = Number(days);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

type AdminAnalyticsPageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const { days } = await searchParams;
  const periodDays = parsePeriod(days);
  const data = await getPlatformAnalytics(periodDays);

  return (
    <>
      <PageHeader
        title="Platform analytics"
        description="GMV, seller health, activation, and receipt backlog."
        actions={
          <Suspense fallback={null}>
            <PeriodSelector active={periodDays} />
          </Suspense>
        }
      />

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_20rem] xl:gap-8">
        <PlatformAnalyticsPanel data={data} />
        <aside aria-label="Metric reference" className="xl:sticky xl:top-6 xl:self-start">
          <MetricGlossary />
        </aside>
      </div>
    </>
  );
}