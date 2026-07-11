"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, RefreshCw } from "lucide-react";
import { OrderStatusTimeline } from "@/components/storefront/order-status-timeline";
import {
  isTerminalOrderStatus,
  type PublicOrderTracking,
} from "@/lib/orders/tracking";
import { orderConfirmationPath } from "@/lib/storefront/paths";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

type OrderTrackingPanelProps = {
  order: PublicOrderTracking;
  storeSlug: string;
  pollEnabled?: boolean;
  pollIntervalMs?: number;
  showConfirmationLink?: boolean;
  /** compact = timeline + summary only (confirmation page). full = track page. */
  variant?: "compact" | "full";
};

type ChipVariant = "neutral" | "success" | "warning" | "danger";

function StatusChip({
  label,
  value,
  variant = "neutral",
}: {
  label: string;
  value: string;
  variant?: ChipVariant;
}) {
  const styles: Record<ChipVariant, string> = {
    neutral: "border-[var(--store-border)] bg-white text-[var(--store-text)]",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-lg border px-2.5 py-2 sm:rounded-xl sm:px-3 ${styles[variant]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-0.5 text-xs font-medium sm:text-sm">{value}</p>
    </div>
  );
}

function headlineVariant(
  status: OrderStatus,
  hasReceipt: boolean,
  paymentRejectionReason?: string | null,
): ChipVariant {
  if (status === "CANCELLED" || status === "REFUNDED") return "danger";
  if (status === "PENDING" && paymentRejectionReason && !hasReceipt) return "danger";
  if (status === "PENDING" && hasReceipt) return "warning";
  if (status === "DELIVERED") return "success";
  if (status === "PAID" || status === "PROCESSING" || status === "SHIPPED") return "success";
  return "neutral";
}

function paymentChipVariant(status: OrderStatus, hasReceipt: boolean): ChipVariant {
  if (status === "CANCELLED" || status === "REFUNDED") return "danger";
  if (status === "PENDING" && !hasReceipt) return "warning";
  if (status === "PENDING" && hasReceipt) return "warning";
  return "success";
}

export function OrderTrackingPanel({
  order: initialOrder,
  storeSlug,
  pollEnabled = true,
  pollIntervalMs = 30_000,
  showConfirmationLink = false,
  variant = "full",
}: OrderTrackingPanelProps) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

  const terminal = isTerminalOrderStatus(order.status);
  const canPoll = pollEnabled && !terminal;
  const compact = variant === "compact";

  const fetchLatest = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/storefront/${storeSlug}/orders/${encodeURIComponent(order.orderNumber)}`,
      );
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order as PublicOrderTracking);
        setLastPolledAt(new Date());
      }
    } catch {
      // silent — next poll will retry
    } finally {
      setRefreshing(false);
    }
  }, [order.orderNumber, storeSlug]);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    if (!canPoll) return;

    const timer = window.setInterval(() => {
      void fetchLatest();
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [canPoll, fetchLatest, pollIntervalMs]);

  const variantTone = headlineVariant(order.status, order.hasReceipt, order.paymentRejectionReason);
  const isPaid =
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";

  const bannerClass =
    variantTone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : variantTone === "warning"
        ? "border-amber-200 bg-amber-50"
        : variantTone === "danger"
          ? "border-red-200 bg-red-50"
          : "border-[var(--store-border)] bg-[var(--store-surface)]";

  const iconClass =
    variantTone === "success"
      ? "text-emerald-600"
      : variantTone === "warning"
        ? "text-amber-600"
        : variantTone === "danger"
          ? "text-red-600"
          : "text-[var(--store-text)]";

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact ? (
        <section className={`rounded-2xl border p-4 sm:p-6 ${bannerClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-12 sm:w-12 ${iconClass}`}
              >
                {isPaid || order.status === "DELIVERED" ? (
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                ) : (
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--store-muted)]">
                  {order.storeName}
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[var(--store-text)] sm:text-2xl">
                  {order.headline}
                </h2>
                <p className="mt-1 break-all font-mono text-xs text-[var(--store-muted)] sm:text-sm">
                  {order.orderNumber}
                </p>
              </div>
            </div>

            {canPoll ? (
              <button
                type="button"
                onClick={() => void fetchLatest()}
                disabled={refreshing}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--store-border)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--store-text)] transition-colors hover:bg-[var(--store-header-bg)] disabled:opacity-60"
                title="Refresh status"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{refreshing ? "Updating…" : "Refresh"}</span>
              </button>
            ) : null}
          </div>

          {canPoll ? (
            <p className="mt-3 text-xs text-[var(--store-muted)]">
              {lastPolledAt
                ? `Updated ${lastPolledAt.toLocaleTimeString()} · auto-refresh every 30s`
                : "Live updates every 30 seconds"}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <StatusChip
              label="Payment"
              value={order.paymentStatus}
              variant={paymentChipVariant(order.status, order.hasReceipt)}
            />
            {order.needsDelivery && order.deliveryStatus ? (
              <StatusChip
                label="Delivery"
                value={order.deliveryStatus}
                variant={
                  order.status === "DELIVERED"
                    ? "success"
                    : order.status === "SHIPPED"
                      ? "warning"
                      : "neutral"
                }
              />
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>

          {order.customerAddress ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-[var(--store-muted)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{order.customerAddress}</span>
            </p>
          ) : null}
        </section>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--store-border)] bg-[var(--store-surface)] px-3 py-2.5 sm:px-4">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <StatusChip
              label="Payment"
              value={order.paymentStatus}
              variant={paymentChipVariant(order.status, order.hasReceipt)}
            />
            {order.needsDelivery && order.deliveryStatus ? (
              <StatusChip
                label="Delivery"
                value={order.deliveryStatus}
                variant={
                  order.status === "DELIVERED"
                    ? "success"
                    : order.status === "SHIPPED"
                      ? "warning"
                      : "neutral"
                }
              />
            ) : null}
          </div>
          {canPoll ? (
            <button
              type="button"
              onClick={() => void fetchLatest()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--store-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--store-text)]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating…" : "Refresh"}
            </button>
          ) : null}
        </div>
      )}

      <OrderStatusTimeline
        status={order.status}
        createdAt={new Date(order.createdAt)}
        updatedAt={new Date(order.updatedAt)}
        hasReceipt={order.hasReceipt}
        receiptSubmittedAt={
          order.receiptSubmittedAt ? new Date(order.receiptSubmittedAt) : null
        }
        paymentRejectionReason={order.paymentRejectionReason}
        customerAddress={order.customerAddress}
        deliveryFee={order.deliveryFee}
      />

      <section className="rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[var(--store-text)]">Order summary</h3>
        <ul className="mt-3 space-y-2.5">
          {order.items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-[var(--store-text)]">
                  {item.title}
                  {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                </p>
                {item.variantName ? (
                  <p className="text-xs text-[var(--store-muted)]">{item.variantName}</p>
                ) : null}
              </div>
              <span className="shrink-0 font-medium text-[var(--store-text)]">
                {formatCurrency(item.lineTotal, order.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1.5 border-t border-[var(--store-border)] pt-3 text-sm">
          <div className="flex justify-between text-[var(--store-muted)]">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          {order.discountAmount > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
            </div>
          ) : null}
          {order.deliveryFee > 0 ? (
            <div className="flex justify-between text-[var(--store-muted)]">
              <span>Delivery</span>
              <span>{formatCurrency(order.deliveryFee, order.currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-semibold text-[var(--store-text)]">
            <span>Total</span>
            <span>{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </section>

      {showConfirmationLink ? (
        <p className="text-center text-sm text-[var(--store-muted)]">
          <Link
            href={orderConfirmationPath(storeSlug, order.orderNumber)}
            className="font-medium text-[var(--store-text)] underline-offset-2 hover:underline"
          >
            View full order details
          </Link>
        </p>
      ) : null}
    </div>
  );
}