"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Repeat,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminActions } from "@/components/admin/admin-actions";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { BreakdownPanel } from "@/components/admin/breakdown-panel";
import { DailyGmvChart } from "@/components/admin/daily-gmv-chart";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { HEALTH_TIER_BADGE, HEALTH_TIER_LABELS } from "@/lib/admin/metrics";
import type { SellerHealthTier } from "@/lib/admin/metrics";
import { formatCurrency } from "@/lib/utils";

export type PlatformAnalyticsData = {
  periodDays: number;
  pulse: {
    gmv: number;
    gmvChange: number | null;
    fulfilledOrders: number;
    ordersChange: number | null;
    avgOrderValue: number;
    activeSellers: number;
    totalStores: number;
    dormantSellers: number;
    activatingSellers: number;
    pendingReceiptBacklog: number;
    repeatCustomerRate: number;
    repeatCustomers: number;
    customersWithOrders: number;
    totalCustomers: number;
    newCustomers: number;
    activationRate: number;
    bankCompletionRate: number;
    catalogRate: number;
  };
  daily: Array<{ date: string; revenue: number; orders: number }>;
  planBreakdown: Array<{ plan: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  tierCounts: Record<SellerHealthTier, number>;
  sellerHealth: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    isActive: boolean;
    ownerName: string;
    ownerEmail: string;
    tier: SellerHealthTier;
    productCount: number;
    orderCount: number;
    customerCount: number;
    periodGmv: number;
    periodOrders: number;
    hasBank: boolean;
    lastOrderAt: string | null;
    createdAt: string;
  }>;
};

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-[#86868b]">—</span>;
  const positive = value >= 0;
  return (
    <span
      className={`text-[11px] font-semibold ${positive ? "text-[#1a7f5a]" : "text-[#c41e1e]"}`}
    >
      {positive ? "+" : ""}
      {value.toFixed(1)}% vs prior period
    </span>
  );
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

type PlatformAnalyticsPanelProps = {
  data: PlatformAnalyticsData;
};

export function PlatformAnalyticsPanel({ data }: PlatformAnalyticsPanelProps) {
  const { pulse, daily, tierCounts, sellerHealth, planBreakdown, statusBreakdown } = data;

  const tierFilters: SellerHealthTier[] = [
    "thriving",
    "active",
    "at_risk",
    "dormant",
    "activating",
    "inactive",
  ];

  const tierTotal = Object.values(tierCounts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-8">
      <section aria-labelledby="platform-pulse">
        <h2 id="platform-pulse" className="sr-only">
          Platform pulse
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list">
          <li>
            <AdminKpiCard
              label={`GMV (${data.periodDays}d)`}
              value={formatCurrency(pulse.gmv, "NGN")}
              icon={TrendingUp}
              tone="gold"
            />
            <p className="mt-1.5 px-1">
              <ChangeBadge value={pulse.gmvChange} />
            </p>
          </li>
          <li>
            <AdminKpiCard
              label="Fulfilled orders"
              value={pulse.fulfilledOrders}
              icon={ShoppingCart}
              tone="emerald"
            />
            <p className="mt-1.5 px-1">
              <ChangeBadge value={pulse.ordersChange} />
            </p>
          </li>
          <li>
            <AdminKpiCard
              label="AOV"
              value={formatCurrency(pulse.avgOrderValue, "NGN")}
              icon={BarChart3}
              tone="blue"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">GMV ÷ fulfilled orders</p>
          </li>
          <li>
            <AdminKpiCard
              label="Active sellers"
              value={pulse.activeSellers}
              icon={Store}
              tone="slate"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">
              of {pulse.totalStores} stores · {pulse.dormantSellers} dormant
            </p>
          </li>
          <li>
            <AdminKpiCard
              label="Repeat customer rate"
              value={pct(pulse.repeatCustomerRate)}
              icon={Repeat}
              tone="emerald"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">
              {pulse.repeatCustomers} of {pulse.customersWithOrders} buyers
            </p>
          </li>
          <li>
            <AdminKpiCard
              label="Receipt backlog"
              value={pulse.pendingReceiptBacklog}
              icon={AlertCircle}
              tone="amber"
              highlight={pulse.pendingReceiptBacklog > 0}
              href="/admin/orders?status=PENDING"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">PENDING + receipt uploaded</p>
          </li>
          <li>
            <AdminKpiCard
              label="Seller activation"
              value={pct(pulse.activationRate)}
              icon={Activity}
              tone="gold"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">
              bank {pct(pulse.bankCompletionRate)} · catalog {pct(pulse.catalogRate)}
            </p>
          </li>
          <li>
            <AdminKpiCard
              label="New customers"
              value={pulse.newCustomers}
              icon={Users}
              tone="blue"
              href="/admin/customers"
            />
            <p className="mt-1.5 px-1 text-[11px] text-[#86868b]">
              {pulse.totalCustomers} total on platform
            </p>
          </li>
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="daily-gmv" className="cf-stat-card lg:col-span-2">
          <h2 id="daily-gmv" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Daily GMV & order volume
          </h2>
          <p className="mt-1 text-[12px] text-[#86868b]">
            Fulfilled revenue (gold) and total order count (blue) by calendar day.
          </p>
          <div className="mt-5">
            <DailyGmvChart daily={daily} />
          </div>
        </section>

        <BreakdownPanel
          id="plan-breakdown"
          title="Stores by plan"
          subtitle="Subscription tier distribution across platform"
          rows={planBreakdown.map((row) => ({
            key: row.plan,
            label: row.plan,
            count: row.count,
          }))}
          variant="plans"
          href="/admin/stores"
          linkLabel="Manage stores"
        />

        <BreakdownPanel
          id="status-breakdown"
          title={`Orders by status (${data.periodDays}d)`}
          subtitle="Fulfillment pipeline in selected period"
          rows={statusBreakdown.map((row) => ({
            key: row.status,
            label: row.status.charAt(0) + row.status.slice(1).toLowerCase(),
            count: row.count,
          }))}
          variant="orders"
          href="/admin/orders"
          linkLabel="View all orders"
        />
      </div>

      <section aria-labelledby="seller-health-tiers" className="cf-stat-card">
        <h2 id="seller-health-tiers" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
          Seller health distribution
        </h2>
        <p className="mt-1 text-[12px] text-[#86868b]">
          {tierTotal} stores classified by recency, catalog, and activity.
        </p>

        {tierTotal > 0 ? (
          <div
            className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-[#f5f5f7]"
            role="img"
            aria-label={`Health tiers: ${tierFilters.map((t) => `${HEALTH_TIER_LABELS[t]} ${tierCounts[t]}`).join(", ")}`}
          >
            {tierFilters.map((tier) => {
              const pctWidth = (tierCounts[tier] / tierTotal) * 100;
              if (pctWidth <= 0) return null;
              const colors: Record<SellerHealthTier, string> = {
                thriving: "bg-[#1a7f5a]",
                active: "bg-[#245bdb]",
                at_risk: "bg-[#e8a317]",
                dormant: "bg-[#86868b]",
                activating: "bg-[#b8956a]",
                inactive: "bg-[#c41e1e]",
              };
              return (
                <div
                  key={tier}
                  className={`${colors[tier]} transition-all`}
                  style={{ width: `${pctWidth}%` }}
                  title={`${HEALTH_TIER_LABELS[tier]}: ${tierCounts[tier]}`}
                />
              );
            })}
          </div>
        ) : null}

        <ul className="mt-4 grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {tierFilters.map((tier) => (
            <li key={tier} className="flex items-center justify-between rounded-lg bg-[#fbfbfd] px-3 py-2">
              <span className={HEALTH_TIER_BADGE[tier]}>{HEALTH_TIER_LABELS[tier]}</span>
              <span className="text-[13px] font-semibold tabular-nums text-[#1d1d1f]">
                {tierCounts[tier]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="seller-health-table">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="seller-health-table" className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
            Seller health — ranked by period GMV
          </h2>
          <Link href="/admin/customers" className="text-[13px] font-medium text-[#b8956a] hover:underline">
            Customer insights →
          </Link>
        </div>
        <div className="cf-table-shell overflow-x-auto">
          <table className="min-w-[960px]">
            <caption className="sr-only">Seller health scores</caption>
            <thead>
              <tr>
                <th scope="col">Store</th>
                <th scope="col">Health</th>
                <th scope="col">Period GMV</th>
                <th scope="col">Catalog</th>
                <th scope="col">Customers</th>
                <th scope="col">Last order</th>
                <th scope="col">Setup</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerHealth.map((store) => (
                <tr key={store.id}>
                  <td>
                    <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                    <StorefrontLink
                      slug={store.slug}
                      storeName={store.name}
                      isActive={store.isActive}
                      className="text-[12px] text-[#b8956a] hover:underline"
                      showIcon={false}
                    />
                    <p className="text-[11px] text-[#86868b]">{store.ownerEmail}</p>
                  </td>
                  <td>
                    <span className={HEALTH_TIER_BADGE[store.tier]}>{HEALTH_TIER_LABELS[store.tier]}</span>
                  </td>
                  <td className="currency font-semibold text-[#1d1d1f]">
                    {formatCurrency(store.periodGmv, "NGN")}
                    <p className="text-[11px] font-normal text-[#86868b]">
                      {store.periodOrders} orders
                    </p>
                  </td>
                  <td className="text-[12px] text-[#6e6e73]">
                    {store.productCount} products
                    <p className="text-[11px]">{store.orderCount} all-time orders</p>
                  </td>
                  <td className="text-[#6e6e73]">{store.customerCount}</td>
                  <td className="text-[12px] text-[#6e6e73]">
                    {store.lastOrderAt ? (
                      <time dateTime={store.lastOrderAt}>
                        {new Date(store.lastOrderAt).toLocaleDateString()}
                      </time>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-[12px]">
                    <span className="cf-badge cf-badge-delivered">{store.plan}</span>
                    <p className={`mt-1 ${store.hasBank ? "text-[#1a7f5a]" : "text-[#9a6700]"}`}>
                      {store.hasBank ? "Bank on file" : "No bank"}
                    </p>
                  </td>
                  <td>
                    <AdminActions
                      businessId={store.id}
                      storeName={store.name}
                      slug={store.slug}
                      isActive={store.isActive}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}