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

  const content = (
    <article
      className={`cf-admin-kpi relative overflow-hidden rounded-[var(--cf-radius-lg)] border p-4 transition-all ${styles.border} ${styles.bg} ${
        href ? "hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[11px] border ${styles.icon}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        {highlight ? (
          <span className="cf-badge cf-badge-pending">Needs attention</span>
        ) : null}
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
        {label}
      </p>
      <p className={`mt-1 text-[1.65rem] font-semibold tabular-nums tracking-tight ${styles.value}`}>
        {value}
      </p>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-[var(--cf-radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8956a]">
        {content}
      </Link>
    );
  }

  return content;
}