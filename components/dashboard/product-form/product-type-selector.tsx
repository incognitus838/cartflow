"use client";

import { Box, Cpu, Leaf, ShoppingBag, Sparkles, UtensilsCrossed } from "lucide-react";
import { PRODUCT_TYPES, type ProductType } from "@/lib/products/product-types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<ProductType, typeof Box> = {
  ONLINE: ShoppingBag,
  PHYSICAL: Box,
  DIGITAL: Cpu,
  FOOD: Leaf,
  SERVICE: Sparkles,
};

type ProductTypeSelectorProps = {
  value: ProductType;
  onChange: (type: ProductType) => void;
};

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <fieldset>
      <legend className="cf-product-label">Product type</legend>
      <p className="mt-1 text-[12px] text-[#86868b]">
        Choose what you sell — the form below updates for that type.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Product type">
        {PRODUCT_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type.value];
          const active = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(type.value)}
              className={cn(
                "cf-product-type-option text-left",
                active && "cf-product-type-option--active",
              )}
            >
              <span className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                    active ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#6e6e73]",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[#1d1d1f]">{type.label}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-[#86868b]">{type.hint}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}