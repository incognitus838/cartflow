import type { OrderStatus } from "@prisma/client";
import { AdminOrdersPanel } from "@/components/admin/admin-orders-panel";
import { PageHeader } from "@/components/shared/page-header";
import { listAdminBusinesses, listAdminOrders } from "@/lib/admin/queries";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type AdminOrdersPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status: statusParam } = await searchParams;
  const initialStatus =
    statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : "";

  const [orders, stores] = await Promise.all([
    listAdminOrders({ take: 500 }),
    listAdminBusinesses({ take: 500 }),
  ]);

  const storeOptions = stores.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order on CartFlow. Click an order to view details and payment receipts (screenshot/PDF, max 100 KB)."
      />
      <AdminOrdersPanel
        initialStatus={initialStatus}
        stores={storeOptions}
        orders={orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          total: order.total,
          paymentProvider: order.paymentProvider,
          createdAt: order.createdAt.toISOString(),
          business: order.business,
        }))}
      />
    </>
  );
}