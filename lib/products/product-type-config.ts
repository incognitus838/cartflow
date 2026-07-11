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
  ONLINE: {
    title: "Online store product",
    subtitle: "Gadgets and goods you sell online — track stock and how you ship to customers.",
    titlePlaceholder: "Wireless Earbuds Pro — Black",
    descriptionPlaceholder: "Specs, what's in the box, warranty, and delivery timeline.",
    categoryPlaceholder: "Gadgets, Phones, Personal brand",
    showStock: true,
    showLowStock: true,
    showVariants: true,
    mediaHint: "Clear product photos build trust online. Show angles, packaging, and scale.",
  },
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
    title: "Service details",
    subtitle: "Personal shoppers, consulting, beauty — explain what customers get and how to book.",
    titlePlaceholder: "Personal Shopping Session — 2 hours",
    descriptionPlaceholder: "What you do, what's included, and how customers prepare for the session.",
    categoryPlaceholder: "Personal shopping, Consulting, Beauty",
    showStock: false,
    showLowStock: false,
    showVariants: true,
    mediaHint: "A mouth-watering photo or service photo builds trust instantly.",
  },
};