export const PRODUCT_TYPES = [
  {
    value: "PHYSICAL",
    label: "Physical Goods",
    hint: "Shippable items with stock and SKU tracking.",
  },
  {
    value: "DIGITAL",
    label: "Digital Product",
    hint: "Courses, eBooks, downloads — auto-delivery via link.",
  },
  {
    value: "FOOD",
    label: "Food & Drinks",
    hint: "Meals, groceries, and beverages — add your own categories.",
  },
  {
    value: "SERVICE",
    label: "Service / Restaurant",
    hint: "Menu items, bookings, or made-to-order services.",
  },
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number]["value"];

export function defaultVariantGroupName(productType: ProductType) {
  switch (productType) {
    case "DIGITAL":
      return "Module";
    case "FOOD":
      return "Weight";
    case "SERVICE":
      return "Option";
    default:
      return "Size";
  }
}