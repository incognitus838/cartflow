import { PRODUCT_TYPES, type ProductType } from "@/lib/products/product-types";

export type CatalogTemplate = {
  id: ProductType;
  label: string;
  description: string;
  categories: string[];
  tags: string[];
};

/** Catalog is defined by what you sell — one template per product type. */
export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: "PHYSICAL",
    label: "Physical Goods",
    description: "Shippable items with stock and SKU tracking.",
    categories: [
      "Fashion & Apparel",
      "Electronics",
      "Home & Living",
      "Beauty & Personal Care",
      "Sports & Outdoors",
      "Books & Stationery",
      "Other",
    ],
    tags: ["bestseller", "new arrival", "sale", "limited stock", "free delivery"],
  },
  {
    id: "DIGITAL",
    label: "Digital Product",
    description: "Courses, eBooks, downloads — auto-delivery via link.",
    categories: [
      "Courses",
      "eBooks & Guides",
      "Templates & Downloads",
      "Software & Tools",
      "Memberships",
      "Bundles",
    ],
    tags: ["beginner", "advanced", "lifetime access", "bestseller", "new launch", "early bird"],
  },
  {
    id: "FOOD",
    label: "Food / Farm Produce",
    description: "Fresh items with expiry and prep time.",
    categories: ["Farm Produce", "Bakery", "Prepared Meals", "Drinks", "Snacks", "Spices & Pantry"],
    tags: ["fresh", "organic", "seasonal", "bestseller", "pre-order"],
  },
  {
    id: "SERVICE",
    label: "Service / Restaurant",
    description: "Menu items, bookings, or made-to-order services.",
    categories: [
      "Restaurant & Menu",
      "Catering",
      "Beauty & Wellness",
      "Events",
      "Consulting",
      "Other Services",
    ],
    tags: ["popular", "booking required", "made to order", "bestseller"],
  },
];

const LEGACY_TEMPLATE_MAP: Record<string, ProductType> = {
  beauty: "PHYSICAL",
  clothing: "PHYSICAL",
  electronics: "PHYSICAL",
  food: "FOOD",
  courses: "DIGITAL",
};

export function isCatalogProductType(id: string | null | undefined): id is ProductType {
  if (!id) return false;
  return PRODUCT_TYPES.some((type) => type.value === id);
}

export function normalizeCatalogTemplateId(templateId: string | null | undefined): ProductType | null {
  if (!templateId) return null;
  if (isCatalogProductType(templateId)) return templateId;
  return LEGACY_TEMPLATE_MAP[templateId] ?? null;
}

export function getCatalogTemplate(id: string) {
  const normalized = normalizeCatalogTemplateId(id);
  if (!normalized) return undefined;
  return CATALOG_TEMPLATES.find((template) => template.id === normalized);
}

export function getCatalogTemplateLabel(id: string | null | undefined) {
  const template = id ? getCatalogTemplate(id) : undefined;
  return template?.label ?? null;
}