"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PromotionType } from "@prisma/client";
import { toast } from "sonner";

export type PromotionFormInitial = {
  id?: string;
  title: string;
  code: string;
  type: PromotionType;
  value: string;
  minOrderAmount: string;
  maxUses: string;
  giftProductId: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

type ProductOption = { id: string; title: string };

type PromotionFormProps = {
  mode: "create" | "edit";
  currency: string;
  products: ProductOption[];
  initial: PromotionFormInitial;
};

const TYPES: Array<{ value: PromotionType; label: string; hint: string }> = [
  {
    value: "PERCENT_OFF",
    label: "Percentage off",
    hint: "e.g. 20% off the order — like Shopify discount codes",
  },
  {
    value: "FIXED_OFF",
    label: "Fixed amount off",
    hint: "e.g. ₦2,000 off when cart qualifies",
  },
  {
    value: "FREE_GIFT",
    label: "Free gift giveaway",
    hint: "Add a free product when order meets minimum — like Kite free-gift offers",
  },
];

export function PromotionForm({ mode, currency, products, initial }: PromotionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [code, setCode] = useState(initial.code);
  const [type, setType] = useState<PromotionType>(initial.type);
  const [value, setValue] = useState(initial.value);
  const [minOrderAmount, setMinOrderAmount] = useState(initial.minOrderAmount);
  const [maxUses, setMaxUses] = useState(initial.maxUses);
  const [giftProductId, setGiftProductId] = useState(initial.giftProductId);
  const [startsAt, setStartsAt] = useState(initial.startsAt);
  const [endsAt, setEndsAt] = useState(initial.endsAt);
  const [isActive, setIsActive] = useState(initial.isActive);

  const typeHint = useMemo(() => TYPES.find((t) => t.value === type)?.hint ?? "", [type]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const payload = {
      title,
      code,
      type,
      value: type === "FREE_GIFT" ? null : value ? Number(value) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      giftProductId: type === "FREE_GIFT" ? giftProductId || null : null,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive,
    };

    try {
      const url = mode === "create" ? "/api/promotions" : `/api/promotions/${initial.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not save promotion");
        return;
      }

      toast.success(mode === "create" ? "Promotion created" : "Promotion updated");
      router.push("/dashboard/promotions");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Offer details</h2>
        <p className="mt-1 text-xs text-slate-500">
          Share the code on WhatsApp, Instagram, or status — customers enter it at checkout.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="Weekend flash sale"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Promo code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-emerald-500"
              placeholder="SUMMER20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Offer type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromotionType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              {TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">{typeHint}</p>
          </div>

          {type === "PERCENT_OFF" ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Discount (%)
              </label>
              <input
                required
                type="number"
                min={1}
                max={100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                placeholder="20"
              />
            </div>
          ) : null}

          {type === "FIXED_OFF" ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount off ({currency})
              </label>
              <input
                required
                type="number"
                min={1}
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                placeholder="2000"
              />
            </div>
          ) : null}

          {type === "FREE_GIFT" ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Free gift product
              </label>
              <select
                required
                value={giftProductId}
                onChange={(e) => setGiftProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Minimum order ({currency}) <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="10000"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Starts <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ends <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Max uses <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="100"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Active — customers can use this code now
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : mode === "create" ? "Create promotion" : "Save changes"}
        </button>
        <Link href="/dashboard/promotions" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}