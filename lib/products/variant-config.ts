import type { ProductType } from "@/lib/products/product-types";
import { defaultVariantGroupName } from "@/lib/products/product-types";

export type VariantUiConfig = {
  sectionDescription: string;
  defaultGroupName: string;
  groupNamePlaceholder: string;
  optionPlaceholder: string;
  variantNamePlaceholder: string;
  singleSkuHint: string;
  trackVariantStock: boolean;
  /** Shown as a tip when no groups exist yet */
  tip?: string;
};

export const VARIANT_UI_CONFIG: Record<ProductType, VariantUiConfig> = {
  ONLINE: {
    sectionDescription:
      "Model, storage, or colour — generate combinations and set stock per variant for your online catalog.",
    defaultGroupName: defaultVariantGroupName("ONLINE"),
    groupNamePlaceholder: "Model",
    optionPlaceholder: "128GB · Midnight Black",
    variantNamePlaceholder: "128GB / Black",
    singleSkuHint: "Single SKU — set stock in inventory below.",
    trackVariantStock: true,
    tip: "Gadget sellers often use Model or Storage; add Colour as a second group if needed.",
  },
  PHYSICAL: {
    sectionDescription:
      "Size, colour, or fit — generate combinations and track stock for each variant.",
    defaultGroupName: defaultVariantGroupName("PHYSICAL"),
    groupNamePlaceholder: "Size",
    optionPlaceholder: "EU 41",
    variantNamePlaceholder: "Size M / Red",
    singleSkuHint: "Single-SKU product — set stock in inventory below.",
    trackVariantStock: true,
    tip: "Fashion and apparel often use Size first, then Colour as a second group.",
  },
  DIGITAL: {
    sectionDescription:
      "Modules, tiers, or bundles — generate combinations; digital products don’t use stock counts.",
    defaultGroupName: defaultVariantGroupName("DIGITAL"),
    groupNamePlaceholder: "Module",
    optionPlaceholder: "Module 1 — Foundations",
    variantNamePlaceholder: "Starter tier / Lifetime",
    singleSkuHint: "Single digital product — set your delivery link above; no stock needed.",
    trackVariantStock: false,
    tip: "Courses often use Module or Tier groups for different access levels.",
  },
  FOOD: {
    sectionDescription:
      "Weight, portion, or flavour — generate combinations and set quantity per variant.",
    defaultGroupName: defaultVariantGroupName("FOOD"),
    groupNamePlaceholder: "Weight",
    optionPlaceholder: "500g",
    variantNamePlaceholder: "500g / Spicy",
    singleSkuHint: "Single portion — set available quantity in inventory below.",
    trackVariantStock: true,
    tip: "Use Weight or Portion for produce; add Flavour as a second group when needed.",
  },
  SERVICE: {
    sectionDescription:
      "Packages, duration, or add-ons — generate combinations for how customers book you.",
    defaultGroupName: defaultVariantGroupName("SERVICE"),
    groupNamePlaceholder: "Package",
    optionPlaceholder: "2-hour personal shopping",
    variantNamePlaceholder: "Standard / Premium",
    singleSkuHint: "Single service offering — set duration and booking notes above; no stock needed.",
    trackVariantStock: false,
    tip: "Personal shoppers often use Package or Duration; add Add-ons as a second group.",
  },
};

export function getVariantUiConfig(productType: ProductType): VariantUiConfig {
  return VARIANT_UI_CONFIG[productType];
}