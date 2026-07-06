import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import type { OrderStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

export type AnalyticsData = {
  periodDays: number;
  totalRevenue: number;
  totalOrders: number;
  daily: Array<{ date: string; revenue: number; orders: number }>;
  statusBreakdown: Array<{ status: OrderStatus; count: number }>;
  topProducts: Array<{ title: string; quantity: number; revenue: number }>;
};

type AnalyticsDashboardProps = {
  analytics: AnalyticsData;
  currency: string;
};

export function AnalyticsDashboard({ analytics, currency }: AnalyticsDashboardProps) {
  const maxRevenue = Math.max(...analytics.daily.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Revenue ({analytics.periodDays}d)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(analytics.totalRevenue, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Orders ({analytics.periodDays}d)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Avg. order value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {analytics.totalOrders > 0
              ? formatCurrency(analytics.totalRevenue / analytics.totalOrders, currency)
              : formatCurrency(0, currency)}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Daily revenue</h2>
        <div className="mt-6 flex h-40 items-end gap-1 sm:gap-2">
          {analytics.daily.length === 0 ? (
            <p className="text-sm text-slate-500">No orders in this period yet.</p>
          ) : (
            analytics.daily.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-emerald-500 transition-all"
                  style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                  title={`${day.date}: ${formatCurrency(day.revenue, currency)}`}
                />
                <span className="hidden text-[10px] text-slate-400 sm:block">
                  {day.date.slice(5)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {analytics.statusBreakdown.map((row) => (
              <li key={row.status} className="flex items-center justify-between text-sm">
                <OrderStatusBadge status={row.status} />
                <span className="font-medium text-slate-900">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Top products</h2>
          <ul className="mt-4 space-y-3">
            {analytics.topProducts.length === 0 ? (
              <li className="text-sm text-slate-500">No sales data yet.</li>
            ) : (
              analytics.topProducts.map((product) => (
                <li key={product.title} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{product.title}</p>
                    <p className="text-xs text-slate-500">{product.quantity} sold</p>
                  </div>
                  <span className="font-medium text-emerald-700">
                    {formatCurrency(product.revenue, currency)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}