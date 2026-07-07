"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { formatCurrency } from "@/lib/utils";

export type CustomerInsightsData = {
  periodDays: number;
  summary: {
    sampledCustomers: number;
    withEmail: number;
    withAddress: number;
    emailCoverage: number;
    addressCoverage: number;
    repeatRateInSample: number;
    newCustomersInSample: number;
    promoOrderRate: number;
    promoOrders: number;
    fulfilledOrdersInPeriod: number;
  };
  topCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    hasAddress: boolean;
    orderCount: number;
    periodOrders: number;
    periodSpend: number;
    lifetimeValue: number;
    isRepeat: boolean;
    lastOrderAt: string | null;
    createdAt: string;
    store: { id: string; name: string; slug: string; currency: string };
  }>;
  recentCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    orderCount: number;
    lifetimeValue: number;
    isRepeat: boolean;
    createdAt: string;
    store: { id: string; name: string; slug: string; currency: string };
  }>;
};

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

type CustomerInsightsPanelProps = {
  data: CustomerInsightsData;
};

export function CustomerInsightsPanel({ data }: CustomerInsightsPanelProps) {
  const [search, setSearch] = useState("");
  const [repeatOnly, setRepeatOnly] = useState(false);

  const filteredTop = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.topCustomers.filter((c) => {
      if (repeatOnly && !c.isRepeat) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.store.name.toLowerCase().includes(q) ||
        c.store.slug.toLowerCase().includes(q)
      );
    });
  }, [data.topCustomers, search, repeatOnly]);

  const { summary } = data;

  return (
    <>
      <section aria-labelledby="customer-kpis">
        <h2 id="customer-kpis" className="sr-only">
          Customer metrics
        </h2>
        <ul className="grid list-none grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {[
            {
              label: "Repeat rate (sample)",
              value: pct(summary.repeatRateInSample),
              sub: `${summary.sampledCustomers} customers loaded`,
            },
            {
              label: "Email coverage",
              value: pct(summary.emailCoverage),
              sub: `${summary.withEmail} with email`,
            },
            {
              label: "Address coverage",
              value: pct(summary.addressCoverage),
              sub: `${summary.withAddress} with address`,
            },
            {
              label: "Promo order share",
              value: pct(summary.promoOrderRate),
              sub: `${summary.promoOrders} of ${summary.fulfilledOrdersInPeriod} fulfilled`,
            },
          ].map((card) => (
            <li key={card.label}>
              <article className="cf-stat-card">
                <p className="cf-stat-label">{card.label}</p>
                <p className="cf-stat-value text-[1.5rem]">{card.value}</p>
                <p className="mt-1 text-[11px] text-[#86868b]">{card.sub}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="top-customers" className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="top-customers" className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
            Top customers by period spend
          </h2>
          <Link href="/admin/analytics" className="text-[13px] font-medium text-[#b8956a] hover:underline">
            Platform analytics →
          </Link>
        </div>

        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchLabel="Search customers"
          searchPlaceholder="Name, phone, email, store…"
          resultCount={filteredTop.length}
          trailing={
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={repeatOnly}
                onClick={() => setRepeatOnly((v) => !v)}
                className={`cf-pill px-3.5 py-1.5 text-[12px] ${
                  repeatOnly ? "cf-pill-active" : "text-[var(--cf-gray-600)]"
                }`}
              >
                Repeat buyers only
              </button>
            </div>
          }
        />

        <div className="cf-table-shell overflow-x-auto">
          <table className="min-w-[880px]">
            <caption className="sr-only">
              Top customers by spend in the last {data.periodDays} days
            </caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Store</th>
                <th scope="col">Period spend</th>
                <th scope="col">Lifetime value</th>
                <th scope="col">Orders</th>
                <th scope="col">Profile</th>
              </tr>
            </thead>
            <tbody>
              {filteredTop.map((customer) => (
                <tr key={`${customer.store.id}-${customer.id}`}>
                  <td>
                    <p className="font-medium text-[#1d1d1f]">{customer.name}</p>
                    <p className="text-[12px] text-[#86868b]">{customer.phone}</p>
                    {customer.isRepeat ? (
                      <span className="mt-1 cf-badge cf-badge-paid">Repeat</span>
                    ) : (
                      <span className="mt-1 cf-badge cf-badge-delivered">One-time</span>
                    )}
                  </td>
                  <td>
                    <p className="font-medium text-[#1d1d1f]">{customer.store.name}</p>
                    <StorefrontLink
                      slug={customer.store.slug}
                      storeName={customer.store.name}
                      className="text-[12px] text-[#b8956a] hover:underline"
                      showIcon={false}
                    />
                  </td>
                  <td className="currency font-semibold text-[#1d1d1f]">
                    {formatCurrency(customer.periodSpend, customer.store.currency)}
                    <p className="text-[11px] font-normal text-[#86868b]">
                      {customer.periodOrders} orders
                    </p>
                  </td>
                  <td className="currency text-[#6e6e73]">
                    {formatCurrency(customer.lifetimeValue, customer.store.currency)}
                  </td>
                  <td className="text-[#6e6e73]">{customer.orderCount}</td>
                  <td className="text-[12px] text-[#6e6e73]">
                    {customer.email ? (
                      <p className="truncate max-w-[140px]">{customer.email}</p>
                    ) : (
                      <p className="text-[#86868b]">No email</p>
                    )}
                    <p className="mt-0.5">{customer.hasAddress ? "Has address" : "No address"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTop.length === 0 ? (
            <p className="cf-table-empty">No customers match your filters.</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="recent-customers" className="mt-10">
        <h2 id="recent-customers" className="mb-4 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
          Recently added customers
        </h2>
        <div className="cf-table-shell overflow-x-auto">
          <table className="min-w-[720px]">
            <caption className="sr-only">Recently registered customers</caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Store</th>
                <th scope="col">LTV</th>
                <th scope="col">Orders</th>
                <th scope="col">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCustomers.map((customer) => (
                <tr key={`recent-${customer.store.id}-${customer.id}`}>
                  <td>
                    <p className="font-medium text-[#1d1d1f]">{customer.name}</p>
                    <p className="text-[12px] text-[#86868b]">{customer.phone}</p>
                  </td>
                  <td className="text-[#6e6e73]">{customer.store.name}</td>
                  <td className="currency text-[#1d1d1f]">
                    {formatCurrency(customer.lifetimeValue, customer.store.currency)}
                  </td>
                  <td className="text-[#6e6e73]">{customer.orderCount}</td>
                  <td className="text-[12px] text-[#6e6e73]">
                    <time dateTime={customer.createdAt}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}