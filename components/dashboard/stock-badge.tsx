import { getProductStock, isLowStock, isOutOfStock } from "@/lib/inventory-stock";
import { cn } from "@/lib/utils";

type StockBadgeProps = {
  stock: unknown;
  lowStockThreshold: unknown;
  variants?: Array<{ stock: unknown }> | null;
};

export function StockBadge({ stock, lowStockThreshold, variants }: StockBadgeProps) {
  const product = { stock, lowStockThreshold, variants };
  const available = getProductStock(product);
  const out = isOutOfStock(product);
  const low = isLowStock(product);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        out && "bg-red-50 text-red-700",
        !out && low && "bg-amber-50 text-amber-800",
        !out && !low && "bg-slate-100 text-slate-700",
      )}
    >
      {available}
      {out ? " · Out of stock" : low ? " · Low" : null}
    </span>
  );
}