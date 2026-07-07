import type { ProductType } from "@/lib/products/product-types";

export type ProductTypeConfig = {
  title: string;
  subtitle: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  categoryPlaceholder: string;
  showStock: boolean;
  showLowStock: boolean;
  showVariants: boolean;
  mediaHint: string;
};

export const PRODUCT_TYPE_CONFIG: Record<ProductType, ProductTypeConfig> = {
  PHYSICAL: {
    title: "Physical product details",
    subtitle: "Shipping, SKU, weight, and stock for items you pack and send.",
    titlePlaceholder: "Ankara Midi Dress — Size 12",
    descriptionPlaceholder: "Fabric, fit, care instructions, and what’s in the box.",
    categoryPlaceholder: "Fashion, Electronics, Home",
    showStock: true,
    showLowStock: true,
    showVariants: true,
    mediaHint: "Show the product from multiple angles. First image is your storefront cover.",
  },
  DIGITAL: {
    title: "Digital product details",
    subtitle: "Courses, eBooks, templates — customers get access after payment.",
    titlePlaceholder: "WhatsApp Sales Masterclass — Module 1",
    descriptionPlaceholder: "What buyers learn, who it’s for, and what they receive instantly.",
    categoryPlaceholder: "Courses, eBooks, Templates",
    showStock: false,
    showLowStock: false,
    showVariants: true,
    mediaHint: "Upload a cover image or short preview video. PDFs can be linked after payment.",
  },
  FOOD: {
    title: "Food & drinks details",
    subtitle: "Fresh items with expiry, prep time, and how you fulfil orders.",
    titlePlaceholder: "Organic Yams — 5 tubers",
    descriptionPlaceholder: "Source, freshness, storage, and how orders are packed.",
    categoryPlaceholder: "Your category — e.g. Bakery, Drinks, Snacks",
    showStock: true,
    showLowStock: true,
    showVariants: true,
    mediaHint: "Clear photos help buyers trust freshness. Show portion size if possible.",
  },
  SERVICE: {
    title: "Service & restaurant details",
    subtitle: "Menu items, bookings, or made-to-order — set how customers order.",
    titlePlaceholder: "Jollof Rice & Chicken — Party Tray",
    descriptionPlaceholder: "What’s included, serving size, and how far in advance to order.",
    categoryPlaceholder: "Restaurant, Catering, Beauty Service",
    showStock: false,
    showLowStock: false,
    showVariants: true,
    mediaHint: "A mouth-watering photo or service photo builds trust instantly.",
  },
};