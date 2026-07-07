import Link from "next/link";
import { OverviewPanel } from "@/components/admin/overview-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="All stores, users, and orders across CartFlow. Manual bank transfer checkout is live platform-wide."
        actions={
          <Link href="/admin/analytics" className="btn-accent text-[13px]">
            Full analytics →
          </Link>
        }
      />
      <OverviewPanel
        stats={{
          businesses: stats.businesses,
          users: stats.users,
          orders: stats.orders,
          pendingOrders: stats.pendingOrders,
          pendingStoreApprovals: stats.pendingStoreApprovals,
          revenue: stats.revenue,
          planBreakdown: stats.planBreakdown,
          statusBreakdown: stats.statusBreakdown,
          recentBusinesses: stats.recentBusinesses.map((store) => ({
            ...store,
            createdAt: store.createdAt.toISOString(),
            submittedAt: store.submittedAt?.toISOString() ?? null,
          })),
          recentOrders: stats.recentOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            total: order.total,
            paymentProvider: order.paymentProvider,
            createdAt: order.createdAt.toISOString(),
            business: {
              id: order.business.id,
              name: order.business.name,
              slug: order.business.slug,
              currency: order.business.currency,
            },
          })),
        }}
      />
    </>
  );
}