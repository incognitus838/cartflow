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
  customerPhone?: string;
  pollEnabled?: boolean;
  pollIntervalMs?: number;
  showConfirmationLink?: boolean;
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
    <div className={`rounded-xl border px-3 py-2 ${styles[variant]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
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
  customerPhone,
  pollEnabled = true,
  pollIntervalMs = 30_000,
  showConfirmationLink = false,
}: OrderTrackingPanelProps) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

  const terminal = isTerminalOrderStatus(order.status);
  const canPoll = pollEnabled && Boolean(customerPhone) && !terminal;

  const fetchLatest = useCallback(async () => {
    if (!customerPhone) return;

    setRefreshing(true);
    try {
      const params = new URLSearchParams({ phone: customerPhone });
      const res = await fetch(
        `/api/storefront/${storeSlug}/orders/${encodeURIComponent(order.orderNumber)}?${params}`,
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
  }, [customerPhone, order.orderNumber, storeSlug]);

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

  const variant = headlineVariant(order.status, order.hasReceipt, order.paymentRejectionReason);
  const isPaid =
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";

  const bannerClass =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50"
      : variant === "warning"
        ? "border-amber-200 bg-amber-50"
        : variant === "danger"
          ? "border-red-200 bg-red-50"
          : "border-[var(--store-border)] bg-[var(--store-surface)]";

  const iconClass =
    variant === "success"
      ? "text-emerald-600"
      : variant === "warning"
        ? "text-amber-600"
        : variant === "danger"
          ? "text-red-600"
          : "text-[var(--store-text)]";

  return (
    <div className="space-y-6">
      <section className={`rounded-2xl border p-5 sm:p-6 ${bannerClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${iconClass}`}
            >
              {isPaid || order.status === "DELIVERED" ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <Clock className="h-7 w-7" />
              )}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--store-muted)]">
                {order.storeName}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--store-text)] sm:text-2xl">
                {order.headline}
              </h2>
              <p className="mt-1 font-mono text-sm text-[var(--store-muted)]">{order.orderNumber}</p>
            </div>
          </div>

          {canPoll ? (
            <button
              type="button"
              onClick={() => void fetchLatest()}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--store-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--store-text)] transition-colors hover:bg-[var(--store-header-bg)] disabled:opacity-60"
              title="Refresh status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating…" : "Refresh"}
            </button>
          ) : null}
        </div>

        {lastPolledAt ? (
          <p className="mt-3 text-xs text-[var(--store-muted)]">
            Last updated {lastPolledAt.toLocaleTimeString()}
            {canPoll ? " — checking automatically every 30s" : ""}
          </p>
        ) : canPoll ? (
          <p className="mt-3 text-xs text-[var(--store-muted)]">Live updates every 30 seconds</p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

        {order.customerAddress ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-[var(--store-muted)]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{order.customerAddress}</span>
          </p>
        ) : null}
      </section>

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

      <section className="rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[var(--store-text)]">Items</h3>
        <ul className="mt-4 space-y-3">
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

        <div className="mt-4 space-y-2 border-t border-[var(--store-border)] pt-4 text-sm">
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