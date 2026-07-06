import { notFound } from "next/navigation";
import { OrderDetailPanel } from "@/components/dashboard/order-detail-panel";
import { AdminActions } from "@/components/admin/admin-actions";
import { getAdminOrder } from "@/lib/admin/order-detail";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { adminOrderReceiptUrl } from "@/lib/storefront/receipt-url";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-[#fbfbfd] px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
            Platform admin view
          </p>
          <p className="text-[14px] font-medium text-[#1d1d1f]">
            {order.business.name}{" "}
            <span className="text-[#86868b]">· owned by {order.business.owner.name}</span>
          </p>
        </div>
        <AdminActions
          businessId={order.business.id}
          storeName={order.business.name}
          slug={order.business.slug}
          isActive={order.business.isActive}
          showStorefront
        />
      </div>

      <OrderDetailPanel
        currency={order.business.currency}
        backHref="/admin/orders"
        backLabel="Back to platform orders"
        receiptSrc={adminOrderReceiptUrl(order.id)}
        patchUrl={`/api/admin/orders/${order.id}`}
        order={{
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          deliveryFee: order.deliveryFee,
          total: order.total,
          promotionCode: order.promotionCode,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customer?.email ?? null,
          customerAddress: order.customerAddress,
          paymentProvider: order.paymentProvider,
          notes: order.notes,
          internalNotes: order.internalNotes,
          hasPaymentReceipt: orderHasReceipt(order),
          paymentReceiptMimeType: order.paymentReceiptMimeType,
          paymentReceiptFilename: order.paymentReceiptFilename,
          paymentReceiptSubmittedAt: order.paymentReceiptSubmittedAt?.toISOString() ?? null,
          createdAt: order.createdAt.toISOString(),
          items: order.items,
          notifications: order.notifications.map((n) => ({
            id: n.id,
            channel: n.channel,
            recipient: n.recipient,
            status: n.status,
            createdAt: n.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}