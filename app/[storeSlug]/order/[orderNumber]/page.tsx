import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CartClearOnOrder } from "@/components/storefront/cart-clear-on-order";
import { OrderConfirmationHeader } from "@/components/storefront/order-confirmation-header";
import { OrderPlacedHero } from "@/components/storefront/order-placed-hero";
import { PaymentReceiptViewer } from "@/components/payment-receipt-viewer";
import { OrderStatusRefresh } from "@/components/storefront/order-status-refresh";
import { OrderTrackingPanel } from "@/components/storefront/order-tracking-panel";
import { ReceiptUploadForm } from "@/components/storefront/receipt-upload-form";
import { orderHasReceipt } from "@/lib/orders/receipt-storage";
import { getTrackingHeadline, isTerminalOrderStatus, toPublicOrderTracking } from "@/lib/orders/tracking";
import { getStoreOrder } from "@/lib/queries/storefront";
import { storefrontOrderReceiptUrl } from "@/lib/storefront/receipt-url";
import { storePath } from "@/lib/storefront/paths";
import { resolveStorefront } from "@/lib/storefront/resolve-store";

type OrderConfirmationProps = {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
  searchParams: Promise<{ placed?: string }>;
};

function statusTone(
  isPaid: boolean,
  paymentRejected: boolean,
  awaitingApproval: boolean,
  status: string,
): "paid" | "rejected" | "awaiting" | "neutral" | "cancelled" {
  if (isPaid) return "paid";
  if (paymentRejected) return "rejected";
  if (awaitingApproval) return "awaiting";
  if (status === "CANCELLED" || status === "REFUNDED") return "cancelled";
  return "neutral";
}

function statusMessage(
  storeName: string,
  isPaid: boolean,
  paymentRejected: boolean,
  awaitingApproval: boolean,
): string {
  if (isPaid) return `${storeName} has confirmed your payment.`;
  if (paymentRejected) return "Upload a new payment receipt using the reason below.";
  if (awaitingApproval) return "The seller will verify your payment shortly.";
  return "Upload your payment receipt to complete this order.";
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationProps) {
  const { storeSlug, orderNumber } = await params;
  const { placed } = await searchParams;
  const store = await resolveStorefront(storeSlug);
  const order = await getStoreOrder(store.id, orderNumber);

  if (!order) {
    notFound();
  }

  const justPlaced = placed === "1";
  const hasReceipt = orderHasReceipt(order);
  const receiptSrc = storefrontOrderReceiptUrl(store.slug, order.orderNumber);
  const isPaid =
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";
  const paymentRejected = order.status === "PENDING" && !hasReceipt && Boolean(order.paymentRejectionReason);
  const awaitingApproval = order.status === "PENDING" && hasReceipt;
  const headline = getTrackingHeadline(order.status, hasReceipt, order.paymentRejectionReason);
  const message = statusMessage(store.name, isPaid, paymentRejected, awaitingApproval);
  const isTerminal = isTerminalOrderStatus(order.status);
  const trackingSnapshot = toPublicOrderTracking(order, {
    name: store.name,
    slug: store.slug,
    currency: store.currency,
  });

  return (
    <div className="mx-auto max-w-2xl px-0 sm:px-0">
      <Suspense fallback={null}>
        <CartClearOnOrder />
      </Suspense>

      <OrderStatusRefresh enabled={!isTerminal} />

      {justPlaced ? (
        <OrderPlacedHero
          storeSlug={store.slug}
          storeName={store.name}
          orderNumber={order.orderNumber}
          statusHeadline={headline}
          statusMessage={message}
        />
      ) : (
        <OrderConfirmationHeader
          storeSlug={store.slug}
          orderNumber={order.orderNumber}
          headline={headline}
          message={message}
          tone={statusTone(isPaid, paymentRejected, awaitingApproval, order.status)}
        />
      )}

      <OrderTrackingPanel
        order={trackingSnapshot}
        storeSlug={store.slug}
        pollEnabled={!isTerminal}
        variant="compact"
      />

      {paymentRejected ? (
        <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:mt-5 sm:p-5">
          <h2 className="text-sm font-semibold text-red-900">Payment not approved</h2>
          <p className="mt-2 text-sm text-red-800">{order.paymentRejectionReason}</p>
        </section>
      ) : null}

      {!isPaid && !hasReceipt ? (
        <div className="mt-4 sm:mt-5">
          <ReceiptUploadForm storeSlug={store.slug} orderNumber={order.orderNumber} />
        </div>
      ) : null}

      {hasReceipt ? (
        <details className="mt-4 rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] sm:mt-5">
          <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-[var(--store-text)] sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
            Payment receipt
            <span className="mt-0.5 block text-xs font-normal text-[var(--store-muted)]">
              Submitted {order.paymentReceiptSubmittedAt?.toLocaleString() ?? "with your order"}
              {awaitingApproval ? " · awaiting approval" : ""}
            </span>
          </summary>
          <div className="border-t border-[var(--store-border)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            <PaymentReceiptViewer
              src={receiptSrc}
              mimeType={order.paymentReceiptMimeType}
              filename={order.paymentReceiptFilename}
            />
          </div>
        </details>
      ) : null}

      <div className="mt-5 sm:mt-6">
        <Link
          href={storePath(store.slug)}
          className="btn-primary block w-full py-3 text-center text-[15px] sm:py-3.5"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}