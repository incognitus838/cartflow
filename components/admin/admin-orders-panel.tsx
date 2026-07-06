"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { AdminActions } from "@/components/admin/admin-actions";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { ORDER_STATUS_BADGE } from "@/lib/ui/order-status-badge";
import { formatCurrency } from "@/lib/utils";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentProvider: string;
  createdAt: string;
  business: { id: string; name: string; slug: string; currency: string };
};

const STATUS_FILTERS: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

type AdminOrdersPanelProps = {
  orders: AdminOrderRow[];
  stores: Array<{ id: string; name: string; slug: string }>;
  initialStatus?: OrderStatus | "";
};

export function AdminOrdersPanel({ orders, stores, initialStatus = "" }: AdminOrdersPanelProps) {
  const [status, setStatus] = useState<"" | OrderStatus>(initialStatus);
  const [search, setSearch] = useState("");
  const [storeId, setStoreId] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status && order.status !== status) return false;
      if (storeId && order.business.id !== storeId) return false;
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        order.business.name.toLowerCase().includes(q) ||
        order.business.slug.toLowerCase().includes(q)
      );
    });
  }, [orders, search, status, storeId]);

  return (
    <section aria-labelledby="admin-orders-heading">
      <h2 id="admin-orders-heading" className="sr-only">
        Platform orders
      </h2>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchLabel="Search orders"
        searchPlaceholder="Order #, customer, phone, store…"
        filters={STATUS_FILTERS}
        activeFilter={status}
        onFilterChange={setStatus}
        filterLegend="Filter orders by status"
        resultCount={filtered.length}
        trailing={
          <div className="w-full lg:w-56">
            <label htmlFor="admin-store-filter" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
              Store
            </label>
            <select
              id="admin-store-filter"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="cf-input py-2.5"
            >
              <option value="">All stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="cf-table-shell overflow-x-auto">
        <table className="min-w-[760px]">
          <caption className="sr-only">Platform orders</caption>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Store</th>
              <th scope="col">Customer</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Payment</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-[13px] font-semibold tracking-tight text-[#1d1d1f] hover:text-[#b8956a]"
                  >
                    {order.orderNumber}
                  </Link>
                  <time className="text-[11px] text-[#86868b]" dateTime={order.createdAt}>
                    {new Date(order.createdAt).toLocaleString()}
                  </time>
                </td>
                <td>
                  <p className="font-medium text-[#1d1d1f]">{order.business.name}</p>
                  <StorefrontLink
                    slug={order.business.slug}
                    storeName={order.business.name}
                    className="text-[12px] text-[#b8956a] hover:underline"
                    showIcon={false}
                  />
                </td>
                <td className="text-[#6e6e73]">
                  <p className="text-[#1d1d1f]">{order.customerName}</p>
                  <p className="text-[12px]">{order.customerPhone}</p>
                </td>
                <td className="currency font-semibold text-[#1d1d1f]">
                  {formatCurrency(order.total, order.business.currency)}
                </td>
                <td>
                  <span className={ORDER_STATUS_BADGE[order.status]}>{order.status}</span>
                </td>
                <td className="text-[12px] text-[#86868b]">
                  {(order.paymentProvider ?? "MANUAL").toLowerCase()}
                </td>
                <td>
                  <AdminActions
                    businessId={order.business.id}
                    storeName={order.business.name}
                    slug={order.business.slug}
                    orderId={order.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="cf-table-empty">No orders match your filters.</p>
        ) : null}
      </div>
    </section>
  );
}