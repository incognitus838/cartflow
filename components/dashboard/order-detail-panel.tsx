"use client";

import Link from "next/link";
import { PaymentReceiptViewer } from "@/components/payment-receipt-viewer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { Mail, MapPin, MessageCircle, Pencil, Phone, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  PaymentReviewHistory,
  type PaymentReviewEvent,
} from "@/components/dashboard/payment-review-history";
import { PaymentReviewActions } from "@/components/dashboard/payment-review-actions";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { toNumber } from "@/lib/decimal";
import { dashboardOrderReceiptUrl } from "@/lib/storefront/receipt-url";
import { buildWhatsAppOrderUrl } from "@/lib/storefront/whatsapp";
import { formatCurrency } from "@/lib/utils";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export type OrderDetailData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: { toString(): string } | number;
  discountAmount?: { toString(): string } | number;
  deliveryFee: { toString(): string } | number;
  total: { toString(): string } | number;
  promotionCode?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string | null;
  notes: string | null;
  paymentProvider?: string;
  internalNotes: string | null;
  hasPaymentReceipt: boolean;
  paymentReceiptMimeType: string | null;
  paymentReceiptFilename: string | null;
  paymentReceiptSubmittedAt: string | Date | null;
  paymentRejectionReason?: string | null;
  paymentEvents?: PaymentReviewEvent[];
  createdAt: string | Date;
  items: Array<{
    id: string;
    title: string;
    variantName: string | null;
    quantity: number;
    unitPrice: { toString(): string } | number;
    total: { toString(): string } | number;
  }>;
  notifications: Array<{
    id: string;
    channel: string;
    recipient: string;
    status: string;
    createdAt: string | Date;
  }>;
};

type OrderDetailPanelProps = {
  order: OrderDetailData;
  currency: string;
  backHref?: string;
  backLabel?: string;
  receiptSrc?: string;
  patchUrl?: string;
  paymentReviewUrl?: string;
};

export function OrderDetailPanel({
  order,
  currency,
  backHref = "/dashboard/orders",
  backLabel = "Back to orders",
  receiptSrc: receiptSrcProp,
  patchUrl,
  paymentReviewUrl,
}: OrderDetailPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerAddress, setCustomerAddress] = useState(order.customerAddress ?? "");
  const [notes, setNotes] = useState(order.notes ?? "");
  const [deliveryFee, setDeliveryFee] = useState(String(toNumber(order.deliveryFee)));
  const [items, setItems] = useState(
    order.items.map((item) => ({
      id: item.id,
      title: item.title,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      total: toNumber(item.total),
    })),
  );
  const [saving, setSaving] = useState(false);

  const orderApi = patchUrl ?? `/api/orders/${order.id}`;
  const canReviewPayment = order.status === "PENDING" && order.hasPaymentReceipt;
  const itemsLocked = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);
  const receiptSrc = receiptSrcProp ?? dashboardOrderReceiptUrl(order.id);

  function updateItemQuantity(id: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              total: item.unitPrice * quantity,
            }
          : item,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const previewSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const previewDiscount = toNumber(order.discountAmount ?? 0);
  const previewDelivery = Number(deliveryFee) || 0;
  const previewTotal = Math.max(0, previewSubtotal - previewDiscount + previewDelivery);
  const whatsappUrl = buildWhatsAppOrderUrl(
    customerPhone,
    `Hi ${customerName}! Regarding your order ${order.orderNumber} for ${formatCurrency(previewTotal, currency)}.`,
  );

  async function handleSave() {
    setSaving(true);
    try {
      const itemPatches = order.items
        .map((original) => {
          const edited = items.find((item) => item.id === original.id);
          if (!edited) return { id: original.id, remove: true };
          if (edited.quantity !== original.quantity) {
            return { id: original.id, quantity: edited.quantity };
          }
          return null;
        })
        .filter((patch): patch is { id: string; remove: true } | { id: string; quantity: number } => patch !== null);

      const res = await fetch(orderApi, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotes,
          customerName,
          customerPhone,
          customerAddress,
          notes,
          deliveryFee: previewDelivery,
          items: itemsLocked ? undefined : itemPatches.length ? itemPatches : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not save");
        return;
      }

      toast.success("Order updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← {backLabel}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Placed {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {order.hasPaymentReceipt ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Payment receipt</h2>
              <p className="mt-1 text-xs text-slate-500">
                {order.paymentReceiptSubmittedAt
                  ? `Submitted ${new Date(order.paymentReceiptSubmittedAt).toLocaleString()}`
                  : "Submitted by customer"}
                {" · "}Stored in database
              </p>
            </div>
          </div>
          <PaymentReceiptViewer
            src={receiptSrc}
            mimeType={order.paymentReceiptMimeType}
            filename={order.paymentReceiptFilename}
            className="mt-4"
          />
          {canReviewPayment ? (
            <div className="mt-4">
              <p className="mb-3 text-xs text-amber-700">
                Verify the transfer matches the order total, then approve or reject with a reason.
              </p>
              <PaymentReviewActions
                orderId={order.id}
                reviewUrl={paymentReviewUrl}
              />
            </div>
          ) : null}
        </section>
      ) : order.status === "PENDING" ? (
        <section className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-amber-900">Awaiting payment receipt</h2>
          <p className="mt-1 text-xs text-amber-800">
            {order.paymentRejectionReason
              ? "The previous payment was rejected — waiting for a new receipt from the customer."
              : "The customer has not uploaded a payment screenshot yet."}
          </p>
          {order.paymentRejectionReason ? (
            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
              Last rejection: {order.paymentRejectionReason}
            </p>
          ) : null}
        </section>
      ) : null}

      {order.paymentEvents && order.paymentEvents.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Payment review history</h2>
          <p className="mt-1 text-xs text-slate-500">
            Approvals, rejections, and receipt submissions for this order.
          </p>
          <div className="mt-4">
            <PaymentReviewHistory events={order.paymentEvents} />
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Customer details</h2>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <label className="mb-1.5 block text-slate-500">Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Phone / WhatsApp
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message on WhatsApp
                </a>
              ) : null}
            </div>
            {order.customerEmail ? (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <a href={`mailto:${order.customerEmail}`} className="font-medium text-slate-900 hover:text-emerald-700">
                  {order.customerEmail}
                </a>
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Delivery address
              </label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-slate-500">
                <StickyNote className="h-3.5 w-3.5" />
                Customer note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Notes from the customer at checkout"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <p className="text-slate-500">Payment</p>
              <p className="mt-0.5 capitalize text-slate-900">
                {(order.paymentProvider ?? "manual").toLowerCase()} bank transfer
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Fulfillment</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Internal notes
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                placeholder="Private notes for your team — not visible to customer"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <button type="button" disabled={saving} onClick={handleSave} className="btn-primary">
              {saving ? "Saving…" : "Save order"}
            </button>
            <p className="text-xs text-slate-500">
              Saves customer details, fulfillment status, items, and delivery fee together.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Items</h2>
          {itemsLocked ? (
            <p className="text-xs text-slate-500">Items are locked after shipping or closure.</p>
          ) : (
            <p className="text-xs text-slate-500">Adjust quantities or remove lines — totals update on save.</p>
          )}
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{item.title}</p>
                {item.variantName ? (
                  <p className="text-xs text-slate-500">{item.variantName}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(item.unitPrice, currency)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!itemsLocked ? (
                  <>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.id, Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-sm outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-slate-600">× {item.quantity}</span>
                )}
                <span className="min-w-[5rem] text-right font-medium text-slate-700">
                  {formatCurrency(item.total, currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(previewSubtotal, currency)}</span>
          </div>
          {previewDiscount > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>
                Discount{order.promotionCode ? ` (${order.promotionCode})` : ""}
              </span>
              <span>-{formatCurrency(previewDiscount, currency)}</span>
            </div>
          ) : null}
          {order.promotionCode && previewDiscount === 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>Promotion</span>
              <span className="font-mono text-xs">{order.promotionCode}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 text-slate-600">
            <span>Delivery</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-emerald-700">{formatCurrency(previewTotal, currency)}</span>
          </div>
        </div>
      </section>

      {order.notifications.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-700">
                  {n.channel} → {n.recipient}
                </span>
                <span className="text-xs font-medium capitalize text-slate-500">{n.status.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}