"use client";

import { Box, Cpu, Leaf, ShoppingBag, Sparkles, UtensilsCrossed } from "lucide-react";
import { getCatalogTemplate } from "@/lib/catalog/templates";
import { PRODUCT_TYPES, type ProductType } from "@/lib/products/product-types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<ProductType, typeof Box> = {
  ONLINE: ShoppingBag,
  PHYSICAL: Box,
  DIGITAL: Cpu,
  FOOD: Leaf,
  SERVICE: Sparkles,
};

type CatalogTypePickerProps = {
  activeType?: ProductType | null;
  applying?: ProductType | null;
  onSelect: (type: ProductType) => void;
  compact?: boolean;
};

export function CatalogTypePicker({
  activeType,
  applying,
  onSelect,
  compact = false,
}: CatalogTypePickerProps) {
  return (
    <fieldset>
      <legend className={compact ? "text-sm font-semibold text-slate-900" : "cf-product-label"}>
        What do you sell?
      </legend>
      <p className={cn("text-slate-500", compact ? "mt-1 text-xs" : "mt-1 text-[12px] text-[#86868b]")}>
        Online gadget sellers, digital creators, and personal shoppers all start here — categories
        and tags are suggested for you.
      </p>
      <div
        className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", compact ? "mt-4" : "mt-3")}
        role="radiogroup"
        aria-label="Catalog product type"
      >
        {PRODUCT_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type.value];
          const active = activeType === type.value;
          const loading = applying === type.value;
          const template = getCatalogTemplate(type.value);

          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={Boolean(applying)}
              onClick={() => onSelect(type.value)}
              className={cn(
                "cf-product-type-option text-left transition-opacity disabled:opacity-60",
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
                  {template ? (
                    <span className="mt-1.5 block text-[10px] font-medium text-emerald-700">
                      {loading
                        ? "Setting up catalog…"
                        : active
                          ? "Active — edit or add categories & tags below"
                          : `${template.categories.length} categories · ${template.tags.length} tags included`}
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}