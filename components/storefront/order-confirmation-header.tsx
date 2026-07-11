import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { OrderIdCopyButton } from "@/components/storefront/order-id-copy-button";
import { trackOrderLookupPath } from "@/lib/storefront/paths";

type OrderConfirmationHeaderProps = {
  storeSlug: string;
  orderNumber: string;
  headline: string;
  message: string;
  tone: "paid" | "rejected" | "awaiting" | "neutral" | "cancelled";
};

const cardStyles = {
  paid: "border-emerald-200 bg-emerald-50",
  rejected: "border-red-200 bg-red-50",
  awaiting: "border-amber-200 bg-amber-50",
  neutral: "border-[var(--store-border)] bg-[var(--store-surface)]",
  cancelled: "border-red-200 bg-red-50",
};

const iconStyles = {
  paid: "text-emerald-600",
  rejected: "text-red-600",
  awaiting: "text-amber-600",
  neutral: "text-[var(--store-text)]",
  cancelled: "text-red-600",
};

export function OrderConfirmationHeader({
  storeSlug,
  orderNumber,
  headline,
  message,
  tone,
}: OrderConfirmationHeaderProps) {
  const trackHref = trackOrderLookupPath(storeSlug, orderNumber);

  return (
    <section className={`mb-5 rounded-2xl border p-4 sm:mb-6 sm:p-6 ${cardStyles[tone]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-12 sm:w-12 ${iconStyles[tone]}`}
          >
            {tone === "paid" ? (
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : (
              <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
            )}
          </span>
          <div className="min-w-0 text-left">
            <h1 className="text-lg font-bold tracking-tight text-[var(--store-text)] sm:text-xl">
              {headline}
            </h1>
            <p className="mt-1 text-sm text-[var(--store-muted)]">{message}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-black/5 pt-3 sm:items-end sm:border-0 sm:pt-0">
          <code className="break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-semibold text-[var(--store-text)] ring-1 ring-[var(--store-border)]">
            {orderNumber}
          </code>
          <div className="flex flex-wrap gap-2">
            <OrderIdCopyButton orderNumber={orderNumber} />
            <Link
              href={trackHref}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--store-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--store-text)] hover:bg-[var(--store-header-bg)] sm:flex-none"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}