import { ShoppingCart } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { mapOrderToInbox } from "@/lib/orders/inbox-map";
import { OrdersList } from "@/components/dashboard/orders-list";
import { requireLivePermission } from "@/lib/auth-server";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { listBusinessOrders } from "@/lib/queries/dashboard";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type OrdersPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { business } = await requireLivePermission("orders");
  const { status: statusParam } = await searchParams;
  const initialStatus =
    statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : "";

  const orders = await listBusinessOrders(business.id);

  const inboxOrders = orders.map((order) =>
    mapOrderToInbox(order, orderHasReceipt(order)),
  );

  const pendingWithReceipt = inboxOrders.filter(
    (o) => o.status === "PENDING" && o.hasPaymentReceipt,
  ).length;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order shows customer contact, delivery details, items, and payment receipts."
        alert={
          pendingWithReceipt > 0 ? (
            <p className="rounded-[var(--cf-radius-md)] border border-[#b8956a]/25 bg-[#fffdf9] px-4 py-3 text-[13px] font-medium text-[#9a6700]">
              {pendingWithReceipt} order{pendingWithReceipt === 1 ? "" : "s"} with receipts ready to
              approve
            </p>
          ) : undefined
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="When customers check out from your store link, orders will appear here with their full details."
        />
      ) : (
        <OrdersList
          orders={inboxOrders}
          currency={business.currency}
          initialStatus={initialStatus}
        />
      )}
    </>
  );
}