export type CatalogTemplate = {
  id: string;
  label: string;
  description: string;
  categories: string[];
  tags: string[];
};

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: "beauty",
    label: "Skincare & beauty",
    description: "Lip care, oral care, skincare, hair, makeup, fragrance, and more.",
    categories: [
      "Lip Care",
      "Oral Care",
      "Body Wash",
      "Face Makeup",
      "Eye Makeup",
      "Nail Care",
      "Skincare",
      "Hair Care",
      "Fragrance",
      "Bath & Body",
    ],
    tags: ["bestseller", "new arrival", "vegan", "SPF", "sensitive skin", "sale", "limited edition"],
  },
  {
    id: "clothing",
    label: "Clothing & fashion",
    description: "Apparel, shoes, bags, and accessories for fashion brands.",
    categories: [
      "Dresses",
      "Tops",
      "Bottoms",
      "Shoes",
      "Accessories",
      "Bags",
      "Traditional Wear",
      "Kids",
      "New Arrivals",
    ],
    tags: ["bestseller", "new arrival", "sale", "limited stock", "custom order", "made to measure"],
  },
  {
    id: "food",
    label: "Food & farm",
    description: "Fresh produce, bakery, prepared meals, and drinks.",
    categories: ["Farm Produce", "Bakery", "Prepared Meals", "Drinks", "Snacks", "Spices"],
    tags: ["fresh", "organic", "seasonal", "bestseller", "pre-order"],
  },
  {
    id: "electronics",
    label: "Electronics",
    description: "Phones, accessories, audio, and home tech.",
    categories: ["Phones", "Accessories", "Audio", "Home Tech", "Gaming", "Cables & Chargers"],
    tags: ["warranty", "refurbished", "new", "bestseller", "clearance"],
  },
  {
    id: "courses",
    label: "Online courses",
    description: "Self-paced programs, live cohorts, workshops, and digital learning products.",
    categories: [
      "Self-Paced Courses",
      "Live Cohorts",
      "Workshops & Webinars",
      "Masterclasses",
      "Certifications",
      "Bundles & Programs",
      "Templates & Downloads",
      "Coaching & Mentorship",
      "Free Previews",
      "Membership",
    ],
    tags: [
      "beginner",
      "intermediate",
      "advanced",
      "lifetime access",
      "certificate included",
      "self-paced",
      "live sessions",
      "bestseller",
      "new launch",
      "early bird",
    ],
  },
];

export function getCatalogTemplate(id: string) {
  return CATALOG_TEMPLATES.find((template) => template.id === id);
}