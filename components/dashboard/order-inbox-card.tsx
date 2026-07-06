import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import {
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
import { toNumber } from "@/lib/decimal";
import { buildWhatsAppOrderUrl } from "@/lib/storefront/whatsapp";
import { formatCurrency } from "@/lib/utils";

export type OrderInboxData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  notes?: string | null;
  promotionCode?: string | null;
  discountAmount?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  hasPaymentReceipt: boolean;
  createdAt: string;
  items: Array<{
    title: string;
    variantName?: string | null;
    quantity: number;
    total: number;
  }>;
};

type OrderInboxCardProps = {
  order: OrderInboxData;
  currency: string;
  compact?: boolean;
};

function isRecentOrder(createdAt: string) {
  const age = Date.now() - new Date(createdAt).getTime();
  return age < 48 * 60 * 60 * 1000;
}

export function OrderInboxCard({ order, currency, compact = false }: OrderInboxCardProps) {
  const whatsappUrl = buildWhatsAppOrderUrl(
    order.customerPhone,
    `Hi ${order.customerName}! Regarding your order ${order.orderNumber}.`,
  );
  const isNew = order.status === "PENDING" && isRecentOrder(order.createdAt);
  const needsReview = order.status === "PENDING" && order.hasPaymentReceipt;

  return (
    <article
      className={`rounded-[var(--cf-radius-lg)] border bg-white transition-shadow hover:shadow-md ${
        needsReview
          ? "border-[#b8956a]/40 ring-1 ring-[#b8956a]/20"
          : isNew
            ? "border-black/[0.08]"
            : "border-black/[0.06]"
      }`}
    >
      <div className="border-b border-black/[0.04] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="font-mono text-[13px] font-semibold text-[#b8956a] hover:underline"
              >
                {order.orderNumber}
              </Link>
              {isNew ? (
                <span className="cf-badge cf-badge-paid">New</span>
              ) : null}
              {needsReview ? (
                <span className="cf-badge cf-badge-pending">Review receipt</span>
              ) : null}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#86868b]">
              <Clock className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className={`grid gap-5 p-5 ${compact ? "" : "lg:grid-cols-2"}`}>
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
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
            Order
          </h3>
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
              <span>Delivery</span>
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

      <div className="flex flex-wrap gap-2 border-t border-black/[0.04] px-5 py-4">
        <Link href={`/dashboard/orders/${order.id}`} className="btn-primary text-sm">
          {needsReview ? "Review & approve" : "View order"}
        </Link>
      </div>
    </article>
  );
}

export function mapOrderToInbox(
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    customerName: string;
    customerPhone: string;
    customerAddress: string | null;
    notes: string | null;
    promotionCode: string | null;
    discountAmount: { toString(): string } | number;
    subtotal: { toString(): string } | number;
    deliveryFee: { toString(): string } | number;
    total: { toString(): string } | number;
    createdAt: Date | string;
    items: Array<{
      title: string;
      variantName: string | null;
      quantity: number;
      total: { toString(): string } | number;
    }>;
    customer?: { email: string | null } | null;
  },
  hasPaymentReceipt: boolean,
): OrderInboxData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customer?.email ?? null,
    customerAddress: order.customerAddress,
    notes: order.notes,
    promotionCode: order.promotionCode,
    discountAmount: toNumber(order.discountAmount),
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
    hasPaymentReceipt,
    createdAt:
      typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      title: item.title,
      variantName: item.variantName,
      quantity: item.quantity,
      total: toNumber(item.total),
    })),
  };
}