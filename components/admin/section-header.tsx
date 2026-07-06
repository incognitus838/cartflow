import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  linkTone?: "gold" | "dark" | "blue" | "emerald";
};

export function AdminSectionHeader({
  id,
  title,
  description,
  href,
  linkLabel = "View all",
  linkTone = "gold",
}: SectionHeaderProps) {
  const linkClass =
    linkTone === "dark"
      ? "cf-link-btn cf-link-btn-dark"
      : linkTone === "blue"
        ? "cf-link-btn cf-link-btn-blue"
        : linkTone === "emerald"
          ? "cf-link-btn cf-link-btn-emerald"
          : "cf-link-btn cf-link-btn-gold";

  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-[#86868b]">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className={linkClass}>
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}