"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import type { CartLine } from "@/lib/cart/types";
import { formatCurrency } from "@/lib/utils";

export type AppliedPromo = {
  code: string;
  title: string;
  type: string;
  discountAmount: number;
  giftLine?: { productId: string; title: string; quantity: number };
};

type PromoCodeInputProps = {
  storeSlug: string;
  lines: CartLine[];
  currency: string;
  applied: AppliedPromo | null;
  onApplied: (promo: AppliedPromo | null) => void;
};

export function PromoCodeInput({
  storeSlug,
  lines,
  currency,
  applied,
  onApplied,
}: PromoCodeInputProps) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [loading, setLoading] = useState(false);

  async function handleApply(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter a promo code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/storefront/${storeSlug}/promotions/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          items: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid promo code.");
        onApplied(null);
        return;
      }

      onApplied(data.promotion);
      toast.success(data.promotion.giftLine ? "Free gift unlocked!" : "Promo code applied!");
    } catch {
      toast.error("Could not apply code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setCode("");
    onApplied(null);
  }

  return (
    <section className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-[var(--cf-gray-600)]" />
        <h2 className="text-sm font-semibold text-[var(--cf-black)]">Promo code</h2>
      </div>

      {applied ? (
        <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-3 text-sm">
          <p className="font-medium text-emerald-900">
            {applied.code} — {applied.title}
          </p>
          {applied.discountAmount > 0 ? (
            <p className="mt-1 text-emerald-800">
              You save {formatCurrency(applied.discountAmount, currency)}
            </p>
          ) : null}
          {applied.giftLine ? (
            <p className="mt-1 text-emerald-800">Includes free {applied.giftLine.title}</p>
          ) : null}
          <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-900"
          >
            Remove code
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            className="min-w-0 flex-1 rounded-lg border border-[var(--cf-gray-200)] px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-[var(--cf-black)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-secondary shrink-0 px-4 py-2.5 text-sm"
          >
            {loading ? "…" : "Apply"}
          </button>
        </form>
      )}
    </section>
  );
}