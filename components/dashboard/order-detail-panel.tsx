"use client";

import Link from "next/link";
import { PaymentReceiptViewer } from "@/components/payment-receipt-viewer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, StickyNote } from "lucide-react";
import { toast } from "sonner";
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
};

export function OrderDetailPanel({
  order,
  currency,
  backHref = "/dashboard/orders",
  backLabel = "Back to orders",
  receiptSrc: receiptSrcProp,
  patchUrl,
}: OrderDetailPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const orderApi = patchUrl ?? `/api/orders/${order.id}`;
  const canApprovePayment = order.status === "PENDING" && order.hasPaymentReceipt;
  const receiptSrc = receiptSrcProp ?? dashboardOrderReceiptUrl(order.id);
  const whatsappUrl = buildWhatsAppOrderUrl(
    order.customerPhone,
    `Hi ${order.customerName}! Regarding your order ${order.orderNumber} for ${formatCurrency(toNumber(order.total), currency)}.`,
  );

  async function handleApprovePayment() {
    setApproving(true);
    try {
      const res = await fetch(orderApi, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not approve payment");
        return;
      }

      setStatus("PAID");
      toast.success("Payment approved — order marked as paid.");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApproving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(orderApi, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes }),
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
            {canApprovePayment ? (
              <button
                type="button"
                disabled={approving}
                onClick={handleApprovePayment}
                className="btn-primary inline-flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {approving ? "Approving…" : "Approve payment"}
              </button>
            ) : null}
          </div>
          <PaymentReceiptViewer
            src={receiptSrc}
            mimeType={order.paymentReceiptMimeType}
            filename={order.paymentReceiptFilename}
            className="mt-4"
          />
          {canApprovePayment ? (
            <p className="mt-3 text-xs text-amber-700">
              Verify the transfer matches the order total, then approve to mark this order as paid.
            </p>
          ) : null}
        </section>
      ) : order.status === "PENDING" ? (
        <section className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-amber-900">Awaiting payment receipt</h2>
          <p className="mt-1 text-xs text-amber-800">
            The customer has not uploaded a payment screenshot yet.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Customer details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-0.5 text-base font-medium text-slate-900">{order.customerName}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Phone / WhatsApp
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <a href={`tel:${order.customerPhone}`} className="font-medium text-slate-900 hover:text-emerald-700">
                  {order.customerPhone}
                </a>
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Message on WhatsApp
                  </a>
                ) : null}
              </dd>
            </div>
            {order.customerEmail ? (
              <div>
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </dt>
                <dd className="mt-0.5">
                  <a href={`mailto:${order.customerEmail}`} className="font-medium text-slate-900 hover:text-emerald-700">
                    {order.customerEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            {order.customerAddress ? (
              <div>
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  Delivery address
                </dt>
                <dd className="mt-0.5 text-slate-900">{order.customerAddress}</dd>
              </div>
            ) : null}
            {order.notes ? (
              <div className="rounded-lg bg-slate-50 px-3 py-3">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <StickyNote className="h-3.5 w-3.5" />
                  Customer note
                </dt>
                <dd className="mt-1 text-slate-900">{order.notes}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-slate-500">Payment</dt>
              <dd className="mt-0.5 capitalize text-slate-900">
                {(order.paymentProvider ?? "manual").toLowerCase()} bank transfer
              </dd>
            </div>
          </dl>
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
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Items</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  {item.title}
                  {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                </p>
                {item.variantName ? (
                  <p className="text-xs text-slate-500">{item.variantName}</p>
                ) : null}
              </div>
              <span className="font-medium text-slate-700">
                {formatCurrency(toNumber(item.total), currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(toNumber(order.subtotal), currency)}</span>
          </div>
          {order.discountAmount && toNumber(order.discountAmount) > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>
                Discount{order.promotionCode ? ` (${order.promotionCode})` : ""}
              </span>
              <span>-{formatCurrency(toNumber(order.discountAmount), currency)}</span>
            </div>
          ) : null}
          {order.promotionCode && (!order.discountAmount || toNumber(order.discountAmount) === 0) ? (
            <div className="flex justify-between text-emerald-700">
              <span>Promotion</span>
              <span className="font-mono text-xs">{order.promotionCode}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-slate-600">
            <span>Delivery</span>
            <span>{formatCurrency(toNumber(order.deliveryFee), currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-emerald-700">{formatCurrency(toNumber(order.total), currency)}</span>
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