/** @typedef {{ slug: string; name: string; type: string; description: string; vertical: string; theme: string; accentColor: string; logoUrl: string; heroProducts: { name: string; price: string; category: string; image: string; alt: string }[] }} DemoStoreConfig */

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&q=80`;

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
    logoUrl: img("1608571423902-eed4a5ad8108"),
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
        image: img("1596462502278-27bfdc403348"),
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
    logoUrl: img("1490481651871-ab68de25d43d"),
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
        image: img("1515372032643-0a0e06c0ec20"),
        alt: "Colorful Ankara outfit",
      },
      {
        name: "Gold Hoop Earrings",
        price: "₦6,500",
        category: "Jewelry",
        image: img("1535632066927-ab7c9ab60908"),
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
    logoUrl: img("1504674900247-0877df9cc836"),
    heroProducts: [
      {
        name: "Party Small Chops Tray",
        price: "₦18,000",
        category: "Catering",
        image: img("1546069901-ba9599a1e090"),
        alt: "Assorted small chops platter",
      },
      {
        name: "Chin Chin Jar (Large)",
        price: "₦3,500",
        category: "Snacks",
        image: img("1606312619070-df48c6274a0e"),
        alt: "Snack jars on a table",
      },
      {
        name: "Fresh Zobo (1L)",
        price: "₦2,200",
        category: "Drinks",
        image: img("1546173152-83d3a8c1c1f0"),
        alt: "Red hibiscus drink bottle",
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
    logoUrl: img("1527864550417-7fd91fda51b0"),
    heroProducts: [
      {
        name: "Wireless Earbuds Pro",
        price: "₦22,000",
        category: "Audio",
        image: img("1590658268037-6bf12165a8df"),
        alt: "Wireless earbuds case",
      },
      {
        name: "20W USB-C Charger",
        price: "₦8,500",
        category: "Accessories",
        image: img("1583394838333-ac0232172ad1"),
        alt: "Phone charger on desk",
      },
      {
        name: "Smart Watch Band",
        price: "₦5,900",
        category: "Wearables",
        image: img("1523275335684-37898b6baf30"),
        alt: "Smart watch on wrist",
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
    logoUrl: img("1586023492125-27b2c045efd7"),
    heroProducts: [
      {
        name: "Linen Throw Pillow Set",
        price: "₦14,500",
        category: "Decor",
        image: img("1584100936592-7f0bc2997b7d"),
        alt: "Neutral throw pillows on sofa",
      },
      {
        name: "Ceramic Dinner Set",
        price: "₦32,000",
        category: "Kitchen",
        image: img("1556910103-1c02745aae4d"),
        alt: "Ceramic plates on table",
      },
      {
        name: "Scented Candle Trio",
        price: "₦9,800",
        category: "Home fragrance",
        image: img("1603002583569-65a3a0a1f4b6"),
        alt: "Scented candles on shelf",
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
    logoUrl: img("1571019614242-c5c5dee9f50b"),
    heroProducts: [
      {
        name: "Resistance Band Set",
        price: "₦7,500",
        category: "Equipment",
        image: img("1517836357463-d25dfeac3438"),
        alt: "Resistance bands for workout",
      },
      {
        name: "Sports Water Bottle",
        price: "₦4,200",
        category: "Accessories",
        image: img("1602143407151-7111542de6e8"),
        alt: "Reusable water bottle",
      },
      {
        name: "Seamless Leggings",
        price: "₦11,000",
        category: "Activewear",
        image: img("1518310385805-722c040209d9"),
        alt: "Athletic leggings flat lay",
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
    logoUrl: img("1503454536595-1d532e913f29"),
    heroProducts: [
      {
        name: "Soft Cotton Onesie Pack",
        price: "₦8,900",
        category: "Baby",
        image: img("1515488042361-ee00e017ddd1"),
        alt: "Folded baby onesies",
      },
      {
        name: "Building Blocks Set",
        price: "₦6,800",
        category: "Toys",
        image: img("1558068718650-df9337c36b32"),
        alt: "Colorful toy blocks",
      },
      {
        name: "School Backpack",
        price: "₦12,500",
        category: "School",
        image: img("1553062407-98eeb64c6a62"),
        alt: "Kids backpack on chair",
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