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

      <section
        aria-label="Admin tools"
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Link
          href="/admin/broadcast"
          className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-[13px] font-semibold text-[#1d1d1f]">Email sellers</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
            Write a message, pick who receives it, remove addresses, choose a page for the
            email button, send via Resend.
          </p>
        </Link>
        <Link
          href="/admin/stores"
          className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-[13px] font-semibold text-[#1d1d1f]">Bulk plan change</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
            On Stores: select many shops or filter by plan, then set FREE / STARTER / PRO /
            ENTERPRISE at once.
          </p>
        </Link>
        <Link
          href="/admin/approvals"
          className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-[13px] font-semibold text-[#1d1d1f]">Store approvals</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#86868b]">
            Review bank, contact, and catalog before a storefront goes live.
          </p>
        </Link>
      </section>

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