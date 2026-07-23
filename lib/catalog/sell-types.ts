/**
 * Onboarding “What do you sell?” choices.
 * Maps to catalog categories so sellers skip a later setup step.
 */

export type SellTypeId =
  | "fashion"
  | "food"
  | "electronics"
  | "beauty"
  | "services"
  | "other";

export type SellType = {
  id: SellTypeId;
  label: string;
  description: string;
  /** Stored as catalog templateId (product type family). */
  templateId: string;
  categories: string[];
  tags: string[];
};

export const SELL_TYPES: SellType[] = [
  {
    id: "fashion",
    label: "Fashion",
    description: "Clothing, shoes and accessories",
    templateId: "PHYSICAL",
    categories: [
      "Clothing",
      "Shoes",
      "Bags & Accessories",
      "Jewellery",
      "Men",
      "Women",
      "Kids",
      "Other",
    ],
    tags: ["bestseller", "new arrival", "sale", "limited stock", "free delivery"],
  },
  {
    id: "food",
    label: "Food",
    description: "Meals, treats and ingredients",
    templateId: "FOOD",
    categories: [
      "Prepared Meals",
      "Snacks & Treats",
      "Drinks",
      "Groceries",
      "Bakery",
      "Spices & Pantry",
      "Other",
    ],
    tags: ["fresh", "organic", "seasonal", "bestseller", "pre-order"],
  },
  {
    id: "electronics",
    label: "Electronics",
    description: "Phones, gadgets and parts",
    templateId: "ONLINE",
    categories: [
      "Phones & Tablets",
      "Gadgets & Accessories",
      "Computers & Office",
      "Audio & Gaming",
      "Parts & Repairs",
      "Deals & Bundles",
      "Other",
    ],
    tags: ["bestseller", "new arrival", "warranty included", "limited stock", "ships nationwide"],
  },
  {
    id: "beauty",
    label: "Beauty",
    description: "Skincare, hair and makeup",
    templateId: "PHYSICAL",
    categories: [
      "Skincare",
      "Haircare",
      "Makeup",
      "Fragrance",
      "Body Care",
      "Tools & Accessories",
      "Other",
    ],
    tags: ["bestseller", "new arrival", "organic", "limited stock", "gift ready"],
  },
  {
    id: "services",
    label: "Services",
    description: "Bookings and appointments",
    templateId: "SERVICE",
    categories: [
      "Consultations",
      "Beauty & Wellness",
      "Home Services",
      "Events",
      "Coaching",
      "Packages",
      "Other Services",
    ],
    tags: ["popular", "booking required", "by appointment", "bestseller", "packages available"],
  },
  {
    id: "other",
    label: "Something else",
    description: "A clean look that fits any store",
    templateId: "PHYSICAL",
    categories: ["Featured", "New arrivals", "Bestsellers", "General", "Other"],
    tags: ["bestseller", "new arrival", "sale", "limited stock"],
  },
];

export function getSellType(id: string | null | undefined): SellType | undefined {
  if (!id) return undefined;
  return SELL_TYPES.find((t) => t.id === id);
}

export function isSellTypeId(id: string | null | undefined): id is SellTypeId {
  return Boolean(id && SELL_TYPES.some((t) => t.id === id));
}
