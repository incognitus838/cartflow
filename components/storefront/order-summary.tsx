import type { CartLine } from "@/lib/cart/types";
import { formatCurrency } from "@/lib/utils";

type OrderSummaryProps = {
  lines: CartLine[];
  currency: string;
  deliveryFee: number;
  subtotal?: number;
  discountAmount?: number;
  giftTitle?: string;
  compact?: boolean;
};

export function OrderSummary({
  lines,
  currency,
  deliveryFee,
  subtotal: subtotalOverride,
  discountAmount = 0,
  giftTitle,
  compact = false,
}: OrderSummaryProps) {
  const subtotal =
    subtotalOverride ?? lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <h2 className="text-sm font-semibold text-slate-900">Order summary</h2>

      <ul className={`space-y-3 ${compact ? "mt-3" : "mt-4"}`}>
        {lines.map((line) => (
          <li key={line.key} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-slate-900">
                {line.title}
                {line.quantity > 1 ? ` × ${line.quantity}` : ""}
              </p>
              {line.variantName ? (
                <p className="text-xs text-slate-500">{line.variantName}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-medium text-slate-700">
              {formatCurrency(line.unitPrice * line.quantity, currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        {discountAmount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount, currency)}</span>
          </div>
        ) : null}
        {giftTitle ? (
          <div className="flex justify-between text-emerald-700">
            <span>Free gift</span>
            <span>{giftTitle}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-slate-600">
          <span>Delivery</span>
          <span>{deliveryFee > 0 ? formatCurrency(deliveryFee, currency) : "Free"}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span className="text-emerald-700">{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}