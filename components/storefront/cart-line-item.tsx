"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { LazyImage } from "@/components/storefront/lazy-image";
import type { CartLine } from "@/lib/cart/types";
import { formatCurrency } from "@/lib/utils";

type CartLineItemProps = {
  line: CartLine;
  currency: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({
  line,
  currency,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  return (
    <div className="flex gap-3 rounded-[14px] border border-black/[0.06] bg-white p-3 sm:gap-4 sm:p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
        {line.imageUrl ? (
          <LazyImage src={line.imageUrl} alt={line.title} sizes="96px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{line.title}</p>
            {line.variantName ? (
              <p className="text-xs text-slate-500 sm:text-sm">{line.variantName}</p>
            ) : null}
            <p className="mt-1 text-sm font-medium tabular-nums text-[#1d1d1f]">
              {formatCurrency(line.unitPrice, currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              disabled={line.quantity <= 1}
              onClick={() => onUpdateQuantity(line.quantity - 1)}
              className="rounded-l-xl p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{line.quantity}</span>
            <button
              type="button"
              disabled={line.quantity >= line.maxStock}
              onClick={() => onUpdateQuantity(line.quantity + 1)}
              className="rounded-r-xl p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(line.unitPrice * line.quantity, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}