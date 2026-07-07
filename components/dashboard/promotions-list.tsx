"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PromotionType } from "@prisma/client";
import { Gift, Percent, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toNumber } from "@/lib/decimal";
import { formatCurrency } from "@/lib/utils";

export type DashboardPromotionRow = {
  id: string;
  title: string;
  code: string;
  type: PromotionType;
  value: { toString(): string } | number | null;
  minOrderAmount: { toString(): string } | number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  giftProduct: { id: string; title: string } | null;
  _count: { orders: number };
};

const TYPE_LABELS: Record<PromotionType, string> = {
  PERCENT_OFF: "Percentage off",
  FIXED_OFF: "Fixed discount",
  FREE_GIFT: "Free gift",
};

function TypeIcon({ type }: { type: PromotionType }) {
  if (type === "FREE_GIFT") return <Gift className="h-4 w-4 text-amber-600" />;
  if (type === "PERCENT_OFF") return <Percent className="h-4 w-4 text-emerald-600" />;
  return <Tag className="h-4 w-4 text-blue-600" />;
}

type PromotionsListProps = {
  promotions: DashboardPromotionRow[];
  currency: string;
  canDelete?: boolean;
};

export function PromotionsList({ promotions, currency, canDelete = true }: PromotionsListProps) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not delete");
        return;
      }

      toast.success("Promotion deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  function describeOffer(promotion: DashboardPromotionRow) {
    if (promotion.type === "PERCENT_OFF") {
      return `${toNumber(promotion.value)}% off`;
    }
    if (promotion.type === "FIXED_OFF") {
      return `${formatCurrency(toNumber(promotion.value), currency)} off`;
    }
    return promotion.giftProduct
      ? `Free ${promotion.giftProduct.title}`
      : "Free gift";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-5 py-3 font-medium">Offer</th>
            <th className="px-5 py-3 font-medium">Code</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Usage</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
              <td className="px-5 py-4">
                <Link
                  href={`/dashboard/promotions/${promotion.id}/edit`}
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  {promotion.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">{describeOffer(promotion)}</p>
              </td>
              <td className="px-5 py-4 font-mono text-xs font-medium text-slate-800">
                {promotion.code}
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <TypeIcon type={promotion.type} />
                  {TYPE_LABELS[promotion.type]}
                </span>
              </td>
              <td className="px-5 py-4 text-slate-600">
                {promotion.usedCount}
                {promotion.maxUses ? ` / ${promotion.maxUses}` : ""} uses
              </td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    promotion.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {promotion.isActive ? "Active" : "Paused"}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(promotion.id, promotion.title)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${promotion.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}