import { cn } from "@/lib/utils";

const STYLES = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-amber-50 text-amber-800",
} as const;

type StatusBadgeProps = {
  status: keyof typeof STYLES;
};

export function StatusBadge({ status }: StatusBadgeProps) {
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