"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PeriodDays } from "@/lib/admin/analytics";

const PERIODS: Array<{ value: PeriodDays; label: string }> = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

type PeriodSelectorProps = {
  active: PeriodDays;
};

export function PeriodSelector({ active }: PeriodSelectorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <fieldset>
      <legend className="sr-only">Analysis period</legend>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((period) => {
          const isActive = active === period.value;
          const params = new URLSearchParams(searchParams.toString());
          params.set("days", String(period.value));
          return (
            <Link
              key={period.value}
              href={`${pathname}?${params.toString()}`}
              aria-current={isActive ? "true" : undefined}
              className={`cf-pill px-3.5 py-1.5 text-[12px] ${
                isActive ? "cf-pill-active" : "text-[var(--cf-gray-600)]"
              }`}
            >
              {period.label}
            </Link>
          );
        })}
      </div>
    </fieldset>
  );
}