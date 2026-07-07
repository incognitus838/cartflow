"use client";

import { useMemo, useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { OrderInboxCard, type OrderInboxData } from "@/components/dashboard/order-inbox-card";
import { FilterToolbar } from "@/components/shared/filter-toolbar";

const STATUS_FILTERS: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

type OrdersListProps = {
  orders: OrderInboxData[];
  currency: string;
  initialStatus?: OrderStatus | "";
};

export function OrdersList({ orders, currency, initialStatus = "" }: OrdersListProps) {
  const [status, setStatus] = useState<"" | OrderStatus>(initialStatus);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status && order.status !== status) return false;
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        order.customerEmail?.toLowerCase().includes(q) ||
        order.customerAddress?.toLowerCase().includes(q) ||
        order.notes?.toLowerCase().includes(q)
      );
    });
  }, [orders, search, status]);

  return (
    <section aria-labelledby="seller-orders-list">
      <h2 id="seller-orders-list" className="sr-only">
        Order inbox
      </h2>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchLabel="Search orders"
        searchPlaceholder="Name, phone, email, order #…"
        filters={STATUS_FILTERS}
        activeFilter={status}
        onFilterChange={setStatus}
        filterLegend="Filter orders by status"
        resultCount={filtered.length}
      />

      <div className="cf-table-shell overflow-hidden rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white">
        <ul role="list">
          {filtered.map((order) => (
            <li key={order.id}>
              <OrderInboxCard order={order} currency={currency} />
            </li>
          ))}
        </ul>
      </div>

      {filtered.length === 0 ? (
        <p className="cf-table-empty rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white">
          No orders match your filters.
        </p>
      ) : null}
    </section>
  );
}