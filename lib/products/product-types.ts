export const PRODUCT_TYPES = [
  {
    value: "ONLINE",
    label: "Online store",
    hint: "Gadgets, electronics, personal brands — sell online & ship. No physical storefront.",
  },
  {
    value: "DIGITAL",
    label: "Digital store",
    hint: "Courses, ebooks, templates — customers get instant access after payment.",
  },
  {
    value: "SERVICE",
    label: "Services & bookings",
    hint: "Personal shoppers, consulting, beauty — customers book your time or expertise.",
  },
  {
    value: "PHYSICAL",
    label: "Retail inventory",
    hint: "Fashion, home goods, and in-stock items you pack and deliver.",
  },
  {
    value: "FOOD",
    label: "Food & drinks",
    hint: "Meals, groceries, and beverages.",
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
      return "Package";
    case "ONLINE":
      return "Model";
    default:
      return "Size";
  }
}

export function isPhysicalLikeProductType(productType: ProductType) {
  return productType === "PHYSICAL" || productType === "ONLINE";
}