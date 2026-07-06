import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { ORDER_STATUS_BADGE } from "@/lib/ui/order-status-badge";
import { planStyleFor } from "@/lib/ui/plan-styles";

type BreakdownRow = {
  key: string;
  label: string;
  count: number;
};

type BreakdownPanelProps = {
  id: string;
  title: string;
  subtitle: string;
  rows: BreakdownRow[];
  variant: "plans" | "orders";
  href?: string;
  linkLabel?: string;
};

function barClass(variant: "plans" | "orders", key: string) {
  if (variant === "plans") return planStyleFor(key).bar;
  const status = key as OrderStatus;
  const map: Partial<Record<OrderStatus, string>> = {
    PENDING: "bg-[#e8a317]",
    PAID: "bg-[#1a7f5a]",
    PROCESSING: "bg-[#245bdb]",
    SHIPPED: "bg-[#534ab7]",
    DELIVERED: "bg-[#6e6e73]",
    CANCELLED: "bg-[#c41e1e]",
    REFUNDED: "bg-[#7c3aed]",
  };
  return map[status] ?? "bg-[#86868b]";
}

function badgeClass(variant: "plans" | "orders", key: string) {
  if (variant === "plans") return planStyleFor(key).badge;
  const status = key as OrderStatus;
  return ORDER_STATUS_BADGE[status] ?? "cf-badge cf-badge-delivered";
}

export function BreakdownPanel({
  id,
  title,
  subtitle,
  rows,
  variant,
  href,
  linkLabel = "View all",
}: BreakdownPanelProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const sorted = [...rows].sort((a, b) => b.count - a.count);

  return (
    <section
      aria-labelledby={id}
      className="cf-breakdown-card overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 border-b border-black/[0.04] px-5 py-4">
        <div>
          <h2 id={id} className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#86868b]">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-semibold tabular-nums tracking-tight text-[#1d1d1f]">
            {total}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">Total</p>
        </div>
      </div>

      {total > 0 ? (
        <>
          <div
            className="flex h-2.5 w-full overflow-hidden bg-[#f5f5f7]"
            role="img"
            aria-label={`Distribution: ${sorted.map((r) => `${r.label} ${r.count}`).join(", ")}`}
          >
            {sorted.map((row) => {
              const pct = (row.count / total) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={row.key}
                  className={`${barClass(variant, row.key)} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${row.label}: ${row.count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          <ul className="divide-y divide-black/[0.04]" role="list">
            {sorted.map((row) => {
              const pct = total > 0 ? (row.count / total) * 100 : 0;
              const planText = variant === "plans" ? planStyleFor(row.key).text : "";

              return (
                <li key={row.key} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${barClass(variant, row.key)}`}
                        aria-hidden
                      />
                      <span className={`truncate text-[13px] font-medium ${planText || "text-[#1d1d1f]"}`}>
                        {row.label}
                      </span>
                      <span className={badgeClass(variant, row.key)}>{row.key}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[13px] font-semibold tabular-nums text-[#1d1d1f]">
                        {row.count}
                      </span>
                      <span className="w-10 text-right text-[11px] tabular-nums text-[#86868b]">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f5f5f7]">
                    <div
                      className={`h-full rounded-full ${barClass(variant, row.key)} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="px-5 py-8 text-center text-[13px] text-[#86868b]">No data yet.</p>
      )}

      {href ? (
        <div className="border-t border-black/[0.04] bg-[#fbfbfd] px-5 py-3">
          <Link href={href} className="cf-link-action cf-link-action-gold">
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : null}
    </section>
  );
}