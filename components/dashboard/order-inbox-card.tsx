"use client";

import Link from "next/link";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  StickyNote,
  Tag,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { buildWhatsAppOrderUrl } from "@/lib/storefront/whatsapp";
import type { OrderInboxData } from "@/lib/orders/inbox-types";
import { formatCurrency } from "@/lib/utils";

export type { OrderInboxData } from "@/lib/orders/inbox-types";

type OrderInboxCardProps = {
  order: OrderInboxData;
  currency: string;
  /** When true (default), shows a compact row that expands on click */
  expandable?: boolean;
};

function isRecentOrder(createdAt: string) {
  const age = Date.now() - new Date(createdAt).getTime();
  return age < 48 * 60 * 60 * 1000;
}

function OrderDetailsBody({ order, currency }: { order: OrderInboxData; currency: string }) {
  const whatsappUrl = buildWhatsAppOrderUrl(
    order.customerPhone,
    `Hi ${order.customerName}! Regarding your order ${order.orderNumber}.`,
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
          Customer
        </h3>
        <dl className="mt-3 space-y-2.5 text-[13px]">
          <div className="flex items-start gap-2">
            <span className="font-medium text-[#1d1d1f]">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6e6e73]">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#86868b]" aria-hidden />
            <a href={`tel:${order.customerPhone}`} className="hover:text-[#b8956a]">
              {order.customerPhone}
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] font-medium text-[#1a7f5a] hover:bg-[#e8f5ef]"
              >
                <MessageCircle className="h-3 w-3" aria-hidden />
                WhatsApp
              </a>
            ) : null}
          </div>
          {order.customerEmail ? (
            <div className="flex items-center gap-2 text-[#6e6e73]">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#86868b]" aria-hidden />
              <a href={`mailto:${order.customerEmail}`} className="hover:text-[#b8956a]">
                {order.customerEmail}
              </a>
            </div>
          ) : null}
          {order.customerAddress ? (
            <div className="flex items-start gap-2 text-[#6e6e73]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#86868b]" aria-hidden />
              <span>{order.customerAddress}</span>
            </div>
          ) : null}
          {order.notes ? (
            <div className="flex items-start gap-2 rounded-[var(--cf-radius-sm)] bg-[#f5f5f7] px-3 py-2 text-[#6e6e73]">
              <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#86868b]" aria-hidden />
              <span>{order.notes}</span>
            </div>
          ) : null}
        </dl>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Order</h3>
        <ul className="mt-3 space-y-2 text-[13px]">
          {order.items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex justify-between gap-3">
              <span className="text-[#1d1d1f]">
                {item.title}
                {item.variantName ? ` · ${item.variantName}` : ""}
                {item.quantity > 1 ? ` ×${item.quantity}` : ""}
              </span>
              <span className="currency shrink-0 font-medium text-[#6e6e73]">
                {formatCurrency(item.total, currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-black/[0.04] pt-3 text-[13px]">
          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between text-[#1a7f5a]">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" aria-hidden />
                Discount{order.promotionCode ? ` (${order.promotionCode})` : ""}
              </span>
              <span className="currency">-{formatCurrency(order.discountAmount, currency)}</span>
            </div>
          ) : order.promotionCode ? (
            <div className="flex justify-between text-[#1a7f5a]">
              <span>Promo</span>
              <span className="font-mono text-[11px]">{order.promotionCode}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[#6e6e73]">
            <span>
              {order.deliveryZoneName ? `Delivery · ${order.deliveryZoneName}` : "Delivery"}
            </span>
            <span className="currency">
              {order.deliveryFee > 0 ? formatCurrency(order.deliveryFee, currency) : "Free"}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-[#1d1d1f]">
            <span>Total</span>
            <span className="currency text-[#1a7f5a]">{formatCurrency(order.total, currency)}</span>
          </div>
        </div>

        {order.hasPaymentReceipt ? (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#9a6700]">
            <Receipt className="h-3.5 w-3.5" aria-hidden />
            Payment receipt attached
          </p>
        ) : order.status === "PENDING" ? (
          <p className="mt-3 text-[11px] text-[#86868b]">No payment receipt yet</p>
        ) : null}
      </section>
    </div>
  );
}

export function OrderInboxCard({ order, currency, expandable = true }: OrderInboxCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isNew = order.status === "PENDING" && isRecentOrder(order.createdAt);
  const needsReview = order.status === "PENDING" && order.hasPaymentReceipt;
  const itemSummary =
    order.items.length === 1
      ? order.items[0].title
      : `${order.items.length} items`;

  if (!expandable) {
    return (
      <article className="rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white p-5">
        <OrderDetailsBody order={order} currency={currency} />
      </article>
    );
  }

  return (
    <article
      className={`border-b border-black/[0.06] last:border-b-0 ${
        needsReview ? "bg-[#fffdf9]" : expanded ? "bg-[#fbfbfd]" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f5f5f7] sm:gap-4 sm:px-5"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#86868b] transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-semibold text-[#1d1d1f]">
              {order.orderNumber}
            </span>
            {isNew ? <span className="cf-badge cf-badge-paid">New</span> : null}
            {needsReview ? (
              <span className="cf-badge cf-badge-pending">Review receipt</span>
            ) : null}
            {order.hasPaymentReceipt && !needsReview ? (
              <Receipt className="h-3.5 w-3.5 text-[#9a6700]" aria-label="Receipt attached" />
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-[#6e6e73]">
            {order.customerName} · {itemSummary}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#86868b]">
            <Clock className="h-3 w-3" aria-hidden />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          <span className="currency text-[13px] font-semibold text-[#1a7f5a]">
            {formatCurrency(order.total, currency)}
          </span>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-black/[0.06] px-4 pb-4 pt-4 sm:px-5">
          <OrderDetailsBody order={order} currency={currency} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/dashboard/orders/${order.id}`} className="btn-primary text-sm">
              {needsReview ? "Review & approve" : "View order"}
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}

