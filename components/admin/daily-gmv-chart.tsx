"use client";

import { formatCurrency } from "@/lib/utils";

type DailyPoint = {
  date: string;
  revenue: number;
  orders: number;
};

type DailyGmvChartProps = {
  daily: DailyPoint[];
  currency?: string;
};

export function DailyGmvChart({ daily, currency = "NGN" }: DailyGmvChartProps) {
  if (daily.length === 0) {
    return <p className="py-8 text-center text-[13px] text-[#86868b]">No orders in this period.</p>;
  }

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...daily.map((d) => d.orders), 1);
  const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = daily.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-[12px] text-[#6e6e73]">
        <span>
          <span className="font-semibold text-[#1d1d1f]">{formatCurrency(totalRevenue, currency)}</span>{" "}
          GMV
        </span>
        <span>
          <span className="font-semibold text-[#1d1d1f]">{totalOrders}</span> orders
        </span>
        <span className="text-[#86868b]">{daily.length} days</span>
      </div>

      {/* Desktop: dual-metric bar chart */}
      <div
        className="hidden sm:flex h-48 items-end gap-1 md:gap-1.5"
        role="img"
        aria-label={`Daily GMV chart: ${daily.map((d) => `${d.date} ${formatCurrency(d.revenue, currency)}`).join(", ")}`}
      >
        {daily.map((day) => {
          const revPct = Math.max(4, (day.revenue / maxRevenue) * 100);
          const ordPct = Math.max(2, (day.orders / maxOrders) * 40);
          return (
            <div
              key={day.date}
              className="group relative flex flex-1 flex-col items-center justify-end gap-0.5"
            >
              <div
                className="w-full max-w-[2rem] rounded-t bg-[#b8956a]/80 transition-all group-hover:bg-[#b8956a]"
                style={{ height: `${revPct}%` }}
              />
              <div
                className="w-full max-w-[2rem] rounded-t bg-[#245bdb]/50 transition-all group-hover:bg-[#245bdb]/70"
                style={{ height: `${ordPct}%` }}
              />
              <span className="mt-1 hidden text-[9px] text-[#86868b] md:block">
                {day.date.slice(5)}
              </span>
              <div className="pointer-events-none absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1d1d1f] px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
                {day.date}: {formatCurrency(day.revenue, currency)} · {day.orders} orders
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: scrollable horizontal chart */}
      <div className="sm:hidden -mx-1 overflow-x-auto pb-2">
        <div className="flex h-40 min-w-[480px] items-end gap-1 px-1">
          {daily.map((day) => {
            const revPct = Math.max(8, (day.revenue / maxRevenue) * 100);
            return (
              <div key={day.date} className="flex w-8 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[#b8956a]"
                  style={{ height: `${revPct}%` }}
                  title={`${day.date}: ${formatCurrency(day.revenue, currency)}`}
                />
                <span className="text-[8px] text-[#86868b]">{day.date.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#86868b]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#b8956a]" aria-hidden />
          GMV (fulfilled)
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <span className="h-2 w-2 rounded-sm bg-[#245bdb]/60" aria-hidden />
          Order volume
        </span>
      </div>
    </div>
  );
}