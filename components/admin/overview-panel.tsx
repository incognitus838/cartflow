import {
  Building2,
  ClipboardCheck,
  Clock,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { BreakdownPanel } from "@/components/admin/breakdown-panel";
import { AdminSectionHeader } from "@/components/admin/section-header";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrderRow } from "@/components/admin/admin-orders-panel";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { RecentStoresTable } from "@/components/admin/recent-stores-table";
import type { AdminStoreRow } from "@/components/admin/stores-table";
import { planStyleFor } from "@/lib/ui/plan-styles";

export type AdminOverviewData = {
  businesses: number;
  users: number;
  orders: number;
  pendingOrders: number;
  pendingStoreApprovals: number;
  revenue: number;
  planBreakdown: Array<{ plan: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  recentBusinesses: AdminStoreRow[];
  recentOrders: AdminOrderRow[];
};

type OverviewPanelProps = {
  stats: AdminOverviewData;
};

export function OverviewPanel({ stats }: OverviewPanelProps) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="platform-kpis">
        <h2 id="platform-kpis" className="sr-only">
          Platform key metrics
        </h2>
        <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-6" role="list">
          <li>
            <AdminKpiCard
              label="Stores"
              value={stats.businesses}
              icon={Building2}
              tone="gold"
              href="/admin/stores"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Users"
              value={stats.users}
              icon={Users}
              tone="blue"
              href="/admin/users"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Orders"
              value={stats.orders}
              icon={ShoppingCart}
              tone="emerald"
              href="/admin/orders"
            />
          </li>
          <li>
            <AdminKpiCard
              label="Pending orders"
              value={stats.pendingOrders}
              icon={Clock}
              tone="amber"
              href="/admin/orders?status=PENDING"
              highlight={stats.pendingOrders > 0}
            />
          </li>
          <li>
            <AdminKpiCard
              label="Store reviews"
              value={stats.pendingStoreApprovals}
              icon={ClipboardCheck}
              tone="amber"
              href="/admin/approvals"
              highlight={stats.pendingStoreApprovals > 0}
            />
          </li>
          <li>
            <AdminKpiCard
              label="Platform revenue"
              value={formatCurrency(stats.revenue, "NGN")}
              icon={TrendingUp}
              tone="slate"
              href="/admin/analytics"
            />
          </li>
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownPanel
          id="plan-breakdown"
          title="Plans breakdown"
          subtitle="Subscription tiers across all stores"
          variant="plans"
          rows={stats.planBreakdown.map((row) => ({
            key: row.plan,
            label: planStyleFor(row.plan).label,
            count: row.count,
          }))}
          href="/admin/stores"
          linkLabel="Manage stores & plans"
        />

        <BreakdownPanel
          id="order-status-breakdown"
          title="Order statuses"
          subtitle="Fulfillment pipeline platform-wide"
          variant="orders"
          rows={stats.statusBreakdown.map((row) => ({
            key: row.status,
            label: row.status.charAt(0) + row.status.slice(1).toLowerCase(),
            count: row.count,
          }))}
          href="/admin/orders"
          linkLabel="Open orders inbox"
        />
      </div>

      <section aria-labelledby="recent-orders-heading">
        <AdminSectionHeader
          id="recent-orders-heading"
          title="Recent orders"
          description="Latest transactions — impersonate a seller from the full orders page."
          href="/admin/orders"
          linkLabel="All orders"
          linkTone="emerald"
        />
        <AdminOrdersTable orders={stats.recentOrders} caption="Recent platform orders" />
      </section>

      <section aria-labelledby="recent-stores-heading">
        <AdminSectionHeader
          id="recent-stores-heading"
          title="Recent stores"
          description="Newest sellers on the platform."
          href="/admin/stores"
          linkLabel="All stores"
          linkTone="gold"
        />
        <RecentStoresTable stores={stats.recentBusinesses} />
      </section>
    </div>
  );
}