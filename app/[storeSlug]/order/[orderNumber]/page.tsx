import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { PaymentReceiptViewer } from "@/components/payment-receipt-viewer";
import { OrderSummary } from "@/components/storefront/order-summary";
import { ReceiptUploadForm } from "@/components/storefront/receipt-upload-form";
import { toNumber } from "@/lib/decimal";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { getStoreOrder } from "@/lib/queries/storefront";
import { storefrontOrderReceiptUrl } from "@/lib/storefront/receipt-url";
import { storePath } from "@/lib/storefront/paths";
import { resolveStorefront } from "@/lib/storefront/resolve-store";
import type { CartLine } from "@/lib/cart/types";

type OrderConfirmationProps = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const { storeSlug, orderNumber } = await params;
  const store = await resolveStorefront(storeSlug);
  const order = await getStoreOrder(store.id, orderNumber);

  if (!order) {
    notFound();
  }

  const lines: CartLine[] = order.items.map((item) => ({
    key: item.id,
    productId: item.productId ?? item.id,
    variantId: item.variantId ?? undefined,
    title: item.title,
    variantName: item.variantName ?? undefined,
    sku: item.sku ?? undefined,
    unitPrice: toNumber(item.unitPrice),
    quantity: item.quantity,
    maxStock: item.quantity,
  }));

  const hasReceipt = orderHasReceipt(order);
  const receiptSrc = storefrontOrderReceiptUrl(store.slug, order.orderNumber);
  const isPaid =
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";
  const awaitingApproval = order.status === "PENDING" && hasReceipt;

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={`rounded-2xl border p-6 text-center sm:p-8 ${
          isPaid
            ? "border-emerald-200 bg-emerald-50"
            : awaitingApproval
              ? "border-amber-200 bg-amber-50"
              : "border-[var(--cf-border-strong)] bg-white"
        }`}
      >
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ${
            isPaid ? "text-emerald-600" : awaitingApproval ? "text-amber-600" : "text-[var(--cf-black)]"
          }`}
        >
          {isPaid ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-[var(--cf-black)]">
          {isPaid ? "Payment confirmed!" : awaitingApproval ? "Receipt submitted" : "Order incomplete"}
        </h1>
        <p className="mt-2 text-sm text-[var(--cf-gray-600)]">
          Order <span className="font-mono font-semibold text-[var(--cf-black)]">{order.orderNumber}</span>
          {isPaid
            ? ` — ${store.name} has confirmed your payment.`
            : awaitingApproval
              ? " — the seller will verify your payment shortly."
              : " — upload your payment receipt to complete this order."}
        </p>
        {!isPaid ? (
          <p className="mt-1 text-xs text-[var(--cf-gray-400)]">
            Status: {order.status.toLowerCase()}
          </p>
        ) : null}
      </div>

      {!isPaid && !hasReceipt ? (
        <div className="mt-6">
          <ReceiptUploadForm storeSlug={store.slug} orderNumber={order.orderNumber} />
        </div>
      ) : null}

      {hasReceipt ? (
        <section className="mt-6 rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--cf-black)]">Your receipt</h2>
          <p className="mt-1 text-xs text-[var(--cf-gray-600)]">
            Submitted {order.paymentReceiptSubmittedAt?.toLocaleString() ?? "with your order"}
            {awaitingApproval ? " — awaiting seller approval." : "."}
          </p>
          <PaymentReceiptViewer
            src={receiptSrc}
            mimeType={order.paymentReceiptMimeType}
            filename={order.paymentReceiptFilename}
            className="mt-4"
          />
        </section>
      ) : null}

      <div className="mt-6">
        <OrderSummary
          lines={lines}
          currency={store.currency}
          deliveryFee={toNumber(order.deliveryFee)}
          subtotal={toNumber(order.subtotal)}
          discountAmount={toNumber(order.discountAmount)}
          giftTitle={
            order.promotionCode && lines.some((l) => l.unitPrice === 0)
              ? lines.find((l) => l.unitPrice === 0)?.title
              : undefined
          }
        />
      </div>

      <div className="mt-6">
        <Link href={storePath(store.slug)} className="btn-primary block py-3 text-center">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}