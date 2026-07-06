"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="cf-product-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h2>
          {description ? (
            <p className="mt-1 text-[12px] text-[#86868b]">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#86868b] transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-5 border-t border-black/[0.06] pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}