import { categoryHeroImage } from "../catalog/demo-images.mjs";
import { productImageUrl } from "../catalog/product-image-catalog.mjs";

/** @typedef {{ slug: string; name: string; type: string; description: string; vertical: string; theme: string; accentColor: string; logoUrl: string; heroProducts: { name: string; price: string; category: string; image: string; alt: string }[] }} DemoStoreConfig */

/** Seven demo stores — index 0 = Sunday … 6 = Saturday (Africa/Lagos). */
/** @type {DemoStoreConfig[]} */
export const DEMO_STORES = [
  {
    slug: "glow-beauty",
    name: "Glow Beauty",
    type: "Beauty & personal care",
    description:
      "Premium makeup, skincare, fragrance, and bath essentials — curated for everyday glow.",
    vertical: "beauty",
    theme: "CLASSIC",
    accentColor: "#b8956a",
    logoUrl: categoryHeroImage("beauty", "skincare"),
    heroProducts: [
      {
        name: "Oud Lagos Serum",
        price: "₦12,500",
        category: "Skincare",
        image: "/landing/oud-lagos-serum.png",
        alt: "Oud Lagos Serum dropper bottle",
      },
      {
        name: "Oud Lagos Eau de Parfum",
        price: "₦28,000",
        category: "Fragrance",
        image: "/landing/oud-lagos-eau-de-parfum.png",
        alt: "Oud Lagos Eau de Parfum bottle",
      },
      {
        name: "Velvet Kiss Lip Oil",
        price: "₦4,800",
        category: "Lip Care",
        image: productImageUrl("beauty", "lip-care", 0),
        alt: "Lip care product flat lay",
      },
    ],
  },
  {
    slug: "chic-threads",
    name: "Chic Threads",
    type: "Fashion & accessories",
    description: "Ankara sets, bags, shoes, and everyday style — DM-ready looks for Lagos life.",
    vertical: "fashion",
    theme: "WARM",
    accentColor: "#c45c3e",
    logoUrl: categoryHeroImage("fashion", "apparel"),
    heroProducts: [
      {
        name: "Lagos Crossbody Bag",
        price: "₦38,500",
        category: "Bags",
        image: "/landing/lagos-crossbody-bag.png",
        alt: "Brown leather crossbody bag",
      },
      {
        name: "Ankara Two-Piece Set",
        price: "₦24,000",
        category: "Apparel",
        image: productImageUrl("fashion", "apparel", 0),
        alt: "Colorful fashion apparel",
      },
      {
        name: "Gold Hoop Earrings",
        price: "₦6,500",
        category: "Jewelry",
        image: productImageUrl("fashion", "accessories", 0),
        alt: "Gold hoop earrings on marble",
      },
    ],
  },
  {
    slug: "lagos-bites",
    name: "Lagos Bites",
    type: "Food & snacks",
    description: "Small chops, pastries, drinks, and party trays — order ahead for pickup or delivery.",
    vertical: "food",
    theme: "WARM",
    accentColor: "#d97706",
    logoUrl: categoryHeroImage("food", "small-chops"),
    heroProducts: [
      {
        name: "Party Small Chops Tray",
        price: "₦18,000",
        category: "Catering",
        image: productImageUrl("food", "small-chops", 0),
        alt: "Food platter on a table",
      },
      {
        name: "Fresh Pastry Box",
        price: "₦3,500",
        category: "Snacks",
        image: productImageUrl("food", "pastries", 0),
        alt: "Fresh pastries on a board",
      },
      {
        name: "Chilled Fruit Punch (1L)",
        price: "₦2,200",
        category: "Drinks",
        image: productImageUrl("food", "drinks", 0),
        alt: "Cold drink with fruit garnish",
      },
    ],
  },
  {
    slug: "tech-square",
    name: "Tech Square",
    type: "Gadgets & electronics",
    description: "Phones, accessories, audio, and home tech — warranty-friendly picks for online sellers.",
    vertical: "tech",
    theme: "DARK",
    accentColor: "#3b82f6",
    logoUrl: categoryHeroImage("tech", "audio"),
    heroProducts: [
      {
        name: "Wireless Earbuds Pro",
        price: "₦22,000",
        category: "Audio",
        image: productImageUrl("tech", "audio", 0),
        alt: "Wireless earbuds case",
      },
      {
        name: "USB-C Charging Kit",
        price: "₦8,500",
        category: "Accessories",
        image: productImageUrl("tech", "chargers", 0),
        alt: "Phone and charging accessories",
      },
      {
        name: "Smart Watch",
        price: "₦5,900",
        category: "Wearables",
        image: productImageUrl("tech", "phones", 0),
        alt: "Smart watch on desk",
      },
    ],
  },
  {
    slug: "home-nest",
    name: "Home Nest",
    type: "Home & living",
    description: "Bedding, kitchen essentials, decor, and organization — make every room feel finished.",
    vertical: "home",
    theme: "CLASSIC",
    accentColor: "#78716c",
    logoUrl: categoryHeroImage("home", "decor"),
    heroProducts: [
      {
        name: "Linen Throw Pillow Set",
        price: "₦14,500",
        category: "Decor",
        image: productImageUrl("home", "bedding", 0),
        alt: "Neutral throw pillows on sofa",
      },
      {
        name: "Ceramic Dinner Set",
        price: "₦32,000",
        category: "Kitchen",
        image: productImageUrl("home", "kitchen", 0),
        alt: "Ceramic plates on table",
      },
      {
        name: "Scented Candle Trio",
        price: "₦9,800",
        category: "Home fragrance",
        image: productImageUrl("home", "decor", 0),
        alt: "Home decor candles on shelf",
      },
    ],
  },
  {
    slug: "fit-vault",
    name: "Fit Vault",
    type: "Fitness & wellness",
    description: "Activewear, supplements, yoga gear, and recovery essentials for everyday training.",
    vertical: "fitness",
    theme: "CLASSIC",
    accentColor: "#1a7f5a",
    logoUrl: categoryHeroImage("fitness", "activewear"),
    heroProducts: [
      {
        name: "Resistance Band Set",
        price: "₦7,500",
        category: "Equipment",
        image: productImageUrl("fitness", "equipment", 0),
        alt: "Resistance bands for workout",
      },
      {
        name: "Sports Water Bottle",
        price: "₦4,200",
        category: "Accessories",
        image: productImageUrl("fitness", "recovery", 0),
        alt: "Reusable water bottle",
      },
      {
        name: "Training Essentials",
        price: "₦11,000",
        category: "Activewear",
        image: productImageUrl("fitness", "activewear", 0),
        alt: "Fitness gear flat lay",
      },
    ],
  },
  {
    slug: "kids-corner",
    name: "Kids Corner",
    type: "Kids & baby",
    description: "Clothes, toys, school supplies, and baby care — trusted picks for busy parents.",
    vertical: "kids",
    theme: "WARM",
    accentColor: "#ec4899",
    logoUrl: categoryHeroImage("kids", "baby"),
    heroProducts: [
      {
        name: "Soft Cotton Onesie Pack",
        price: "₦8,900",
        category: "Baby",
        image: productImageUrl("kids", "baby", 0),
        alt: "Baby clothes and essentials",
      },
      {
        name: "Creative Play Set",
        price: "₦6,800",
        category: "Toys",
        image: productImageUrl("kids", "toys", 0),
        alt: "Kids toys and learning items",
      },
      {
        name: "School Backpack",
        price: "₦12,500",
        category: "School",
        image: productImageUrl("kids", "school", 0),
        alt: "Kids backpack and supplies",
      },
    ],
  },
];

export const DEMO_STORE_SLUGS = DEMO_STORES.map((store) => store.slug);

const LAGOS_TZ = "Africa/Lagos";

export function getDayIndexInLagos(date = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: LAGOS_TZ,
    weekday: "short",
  }).format(date);

  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

export function getDailyDemoStore(date = new Date()) {
  const index = getDayIndexInLagos(date);
  return DEMO_STORES[index];
}

export function getDemoStoreBySlug(slug) {
  return DEMO_STORES.find((store) => store.slug === slug) ?? null;
}