import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  PAID: "bg-emerald-50 text-emerald-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-500",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        STYLES[status],
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}