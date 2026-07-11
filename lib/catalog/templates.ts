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
    id: "ONLINE",
    label: "Online store",
    description: "Gadgets, electronics, and personal brands — sell online and ship nationwide.",
    categories: [
      "Gadgets & Electronics",
      "Phones & Accessories",
      "Personal Brands",
      "Home & Office Tech",
      "Gaming & Entertainment",
      "Deals & Bundles",
      "Other",
    ],
    tags: [
      "bestseller",
      "new arrival",
      "ships nationwide",
      "warranty included",
      "limited stock",
      "online exclusive",
    ],
  },
  {
    id: "DIGITAL",
    label: "Digital store",
    description: "Courses, ebooks, and downloads — instant delivery after payment approval.",
    categories: [
      "Online Courses",
      "eBooks & Guides",
      "Templates & Downloads",
      "Software & Tools",
      "Memberships",
      "Coaching & Masterclasses",
      "Bundles",
    ],
    tags: ["beginner", "advanced", "lifetime access", "bestseller", "new launch", "instant access"],
  },
  {
    id: "SERVICE",
    label: "Services & bookings",
    description: "Personal shoppers, consulting, beauty, and professional services.",
    categories: [
      "Personal Shopping",
      "Concierge & Errands",
      "Consulting & Coaching",
      "Beauty & Wellness",
      "Events & Catering",
      "Home Services",
      "Other Services",
    ],
    tags: ["popular", "booking required", "by appointment", "bestseller", "packages available"],
  },
  {
    id: "PHYSICAL",
    label: "Retail inventory",
    description: "Fashion, home goods, and stocked items you pack and deliver.",
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
    id: "FOOD",
    label: "Food & Drinks",
    description: "Meals, groceries, and beverages.",
    categories: ["Bakery", "Prepared Meals", "Drinks", "Snacks", "Groceries", "Spices & Pantry"],
    tags: ["fresh", "organic", "seasonal", "bestseller", "pre-order"],
  },
];

const LEGACY_TEMPLATE_MAP: Record<string, ProductType> = {
  beauty: "PHYSICAL",
  clothing: "PHYSICAL",
  electronics: "ONLINE",
  online: "ONLINE",
  food: "FOOD",
  courses: "DIGITAL",
  services: "SERVICE",
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