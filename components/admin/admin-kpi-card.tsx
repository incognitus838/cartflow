import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type AdminKpiTone = "gold" | "blue" | "emerald" | "amber" | "slate";

const TONE_STYLES: Record<
  AdminKpiTone,
  { icon: string; border: string; bg: string; value: string }
> = {
  gold: {
    icon: "bg-[#fffdf9] text-[#b8956a] border-[#b8956a]/20",
    border: "border-[#b8956a]/25",
    bg: "bg-gradient-to-br from-[#fffdf9] to-white",
    value: "text-[#1d1d1f]",
  },
  blue: {
    icon: "bg-[#eef4ff] text-[#245bdb] border-[#245bdb]/15",
    border: "border-[#245bdb]/20",
    bg: "bg-gradient-to-br from-[#f8faff] to-white",
    value: "text-[#1d1d1f]",
  },
  emerald: {
    icon: "bg-[#e8f5ef] text-[#1a7f5a] border-[#1a7f5a]/15",
    border: "border-[#1a7f5a]/20",
    bg: "bg-gradient-to-br from-[#f6fdf9] to-white",
    value: "text-[#1d1d1f]",
  },
  amber: {
    icon: "bg-[#fff8eb] text-[#9a6700] border-[#e8a317]/20",
    border: "border-[#e8a317]/30",
    bg: "bg-gradient-to-br from-[#fffdf5] to-white",
    value: "text-[#9a6700]",
  },
  slate: {
    icon: "bg-[#f5f5f7] text-[#1d1d1f] border-black/[0.06]",
    border: "border-black/[0.08]",
    bg: "bg-white",
    value: "text-[#1d1d1f]",
  },
};

type AdminKpiCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: AdminKpiTone;
  href?: string;
  highlight?: boolean;
};

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  tone = "slate",
  href,
  highlight = false,
}: AdminKpiCardProps) {
  const styles = TONE_STYLES[highlight ? "amber" : tone];
  const valueText = String(value);
  const compactValue = valueText.length > 9;

  const content = (
    <article
      className={`cf-admin-kpi relative overflow-hidden rounded-[var(--cf-radius-lg)] border p-3 transition-all sm:p-4 ${styles.border} ${styles.bg} ${
        href ? "hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
    >
      {highlight ? (
        <span
          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#e8a317] sm:hidden"
          aria-label="Needs attention"
        />
      ) : null}
      <div className="flex items-center gap-2.5 sm:block">
        <div className="flex shrink-0 items-start justify-between sm:mb-0">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-[10px] border sm:h-9 sm:w-9 sm:rounded-[11px] ${styles.icon}`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} aria-hidden />
          </span>
          {highlight ? (
            <span className="cf-badge cf-badge-pending ml-2 hidden sm:inline-flex">Needs attention</span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[#86868b] sm:text-[11px]">
            {label}
          </p>
          <p
            className={`mt-0.5 font-semibold tabular-nums tracking-tight sm:mt-1 ${styles.value} ${
              compactValue
                ? "text-[13px] leading-tight sm:text-lg lg:text-[1.65rem]"
                : "truncate text-lg sm:text-[1.65rem]"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[var(--cf-radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8956a]"
      >
        {content}
      </Link>
    );
  }

  return content;
}