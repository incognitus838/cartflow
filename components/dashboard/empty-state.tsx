import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--cf-radius-lg)] border border-dashed border-black/[0.1] bg-[#fbfbfd] px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--cf-radius-md)] bg-white text-[#b8956a] shadow-sm">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#86868b]">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}