import { notFound } from "next/navigation";
import { OrderDetailPanel } from "@/components/dashboard/order-detail-panel";
import { requireBusiness } from "@/lib/auth-server";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { getBusinessOrder } from "@/lib/queries/dashboard";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { business } = await requireBusiness();
  const { id } = await params;
  const order = await getBusinessOrder(business.id, id);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailPanel
      currency={business.currency}
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
  );
}