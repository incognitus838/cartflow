import Link from "next/link";
import { StorefrontLink } from "@/components/admin/storefront-link";
import { ORDER_STATUS_BADGE } from "@/lib/ui/order-status-badge";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrderRow } from "@/components/admin/admin-orders-panel";

type AdminOrdersTableProps = {
  orders: AdminOrderRow[];
  caption?: string;
};

export function AdminOrdersTable({ orders, caption = "Platform orders" }: AdminOrdersTableProps) {
  return (
    <div className="cf-table-shell">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Store</th>
            <th scope="col">Customer</th>
            <th scope="col">Total</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-[13px] font-semibold text-[#1d1d1f] hover:text-[#b8956a]"
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
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 ? <p className="cf-table-empty">No orders yet.</p> : null}
    </div>
  );
}