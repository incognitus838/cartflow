import { generateBeautyCatalog } from "./beauty-categories.mjs";
import { productImageUrl } from "./product-image-catalog.mjs";

const PRODUCTS_PER_CATEGORY = 4;

function buildCatalog({ prefix, collectionLabel, pool, categories }) {
  const products = [];
  let skuCounter = 1000;

  categories.forEach((cat) => {
    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      const brand = cat.brands[i % cat.brands.length];
      const type = cat.types[i % cat.types.length];
      const note = cat.notes[i % cat.notes.length];
      const shade = cat.shades[i % cat.shades.length];
      const image = productImageUrl(pool, cat.slug, i);
      const title = `${brand} ${note} ${type} — ${shade}`;
      const basePrice =
        cat.priceRange[0] +
        Math.floor(((i * 137 + cat.slug.length * 41) % 100) / 100) *
          (cat.priceRange[1] - cat.priceRange[0]);
      const compareAt = i % 3 === 0 ? Math.round(basePrice * 1.15) : null;
      const hasVariants = i % 3 !== 2;
      const variantCount = hasVariants ? 2 : 0;

      skuCounter += 1;
      const skuBase = `${prefix}-${cat.slug.slice(0, 3).toUpperCase()}-${skuCounter}`;

      const variants = [];
      if (variantCount > 0) {
        for (let v = 0; v < variantCount; v++) {
          variants.push({
            name: cat.variantNames[v % cat.variantNames.length],
            sku: `${skuBase}-${v + 1}`,
            stock: 8 + ((i + v * 3) % 30),
            price: v === 1 ? Math.round(basePrice * 1.1) : null,
          });
        }
      }

      products.push({
        title,
        description: `${cat.label} pick from ${collectionLabel}. ${note} — ready to ship.`,
        category: cat.label,
        price: basePrice,
        compareAtPrice: compareAt,
        stock: variantCount > 0 ? 0 : 10 + (i % 25),
        status: "ACTIVE",
        lowStockThreshold: 5,
        images: [{ url: image, alt: title, sortOrder: 0 }],
        variants,
      });
    }
  });

  return products;
}

const VERTICALS = {
  fashion: {
    prefix: "CT",
    collectionLabel: "Chic Threads",
    pool: "fashion",
    categories: [
      {
        slug: "apparel",
        label: "Apparel",
        brands: ["Lagos Loom", "Chic Ankara", "Silk Route", "Urban Wrap"],
        types: ["Two-Piece Set", "Maxi Dress", "Kaftan", "Shirt Dress"],
        notes: ["Limited", "New season", "Best seller", "Custom fit"],
        shades: ["Coral", "Navy", "Emerald", "Gold print"],
        priceRange: [12000, 45000],
        variantNames: ["UK 8", "UK 10", "UK 12"],
      },
      {
        slug: "bags",
        label: "Bags",
        brands: ["Lagos Leather", "Mini Muse", "City Tote", "Evening Clutch"],
        types: ["Crossbody", "Tote", "Clutch", "Shoulder Bag"],
        notes: ["Genuine leather", "Hand-stitched", "Compact", "Statement"],
        shades: ["Tan", "Black", "Oxblood", "Cream"],
        priceRange: [15000, 55000],
        variantNames: ["Standard", "Mini"],
      },
      {
        slug: "shoes",
        label: "Shoes",
        brands: ["Stride Co", "Heel House", "Comfort Step", "Weekend Slip"],
        types: ["Heels", "Sandals", "Loafers", "Slides"],
        notes: ["Party", "Everyday", "Comfort sole", "Limited"],
        shades: ["Nude", "Black", "Gold", "White"],
        priceRange: [18000, 42000],
        variantNames: ["Size 38", "Size 40", "Size 42"],
      },
      {
        slug: "accessories",
        label: "Accessories",
        brands: ["Gilded", "Pearl & Co", "Sunset Studio", "Minimal Gold"],
        types: ["Earrings", "Necklace", "Belt", "Scarf"],
        notes: ["Gold-plated", "Handmade", "Gift-ready", "Everyday"],
        shades: ["Gold", "Silver", "Rose gold", "Mixed"],
        priceRange: [3500, 18000],
        variantNames: ["One size", "Adjustable"],
      },
    ],
  },
  food: {
    prefix: "LB",
    collectionLabel: "Lagos Bites",
    pool: "food",
    categories: [
      {
        slug: "small-chops",
        label: "Small Chops",
        brands: ["Party Tray", "Lagos Feast", "Bite Box", "Golden Fry"],
        types: ["Spring Rolls", "Puff Puff", "Samosa", "Meat Pie"],
        notes: ["Fresh daily", "Party size", "Mini tray", "Spicy"],
        shades: ["12 pcs", "24 pcs", "36 pcs", "48 pcs"],
        priceRange: [2500, 22000],
        variantNames: ["Small tray", "Large tray"],
      },
      {
        slug: "pastries",
        label: "Pastries",
        brands: ["Butter & Bloom", "Sweet Lagos", "Oven Story", "Cake Lab"],
        types: ["Cupcakes", "Cinnamon Roll", "Meat Pie", "Donuts"],
        notes: ["Baked morning", "Custom icing", "Classic", "Assorted"],
        shades: ["6 pack", "12 pack", "Single", "Dozen"],
        priceRange: [1800, 15000],
        variantNames: ["Box of 6", "Box of 12"],
      },
      {
        slug: "drinks",
        label: "Drinks",
        brands: ["Zobo Fresh", "Palm Chill", "Citrus Jar", "Chapman Co"],
        types: ["Zobo", "Chapman", "Fruit Punch", "Ginger Drink"],
        notes: ["No preservatives", "Chilled", "Party jug", "Sugar-free"],
        shades: ["500ml", "1L", "2L", "5L"],
        priceRange: [1200, 8500],
        variantNames: ["1L", "2L"],
      },
      {
        slug: "meal-prep",
        label: "Meal Prep",
        brands: ["Home Kitchen", "Lunch Club", "Fit Plate", "Sunday Pot"],
        types: ["Jollof Pack", "Fried Rice", "Soup Bowl", "Protein Bowl"],
        notes: ["Ready to heat", "Weekend special", "Low oil", "Family size"],
        shades: ["Single", "Double", "Family", "Office"],
        priceRange: [3500, 12000],
        variantNames: ["Regular", "Large"],
      },
    ],
  },
  tech: {
    prefix: "TS",
    collectionLabel: "Tech Square",
    pool: "tech",
    categories: [
      {
        slug: "audio",
        label: "Audio",
        brands: ["SoundWave", "BassLine", "QuietPro", "Studio Buds"],
        types: ["Earbuds", "Headphones", "Speaker", "Mic Kit"],
        notes: ["ANC", "Wireless", "Fast pair", "Studio"],
        shades: ["Black", "White", "Navy", "Silver"],
        priceRange: [8500, 65000],
        variantNames: ["Standard", "Pro"],
      },
      {
        slug: "chargers",
        label: "Chargers & cables",
        brands: ["PowerDock", "ChargeFast", "CablePro", "DualPort"],
        types: ["USB-C Charger", "Lightning Cable", "Power Bank", "Car Charger"],
        notes: ["20W", "65W", "Braided", "MagSafe"],
        shades: ["1m", "2m", "10000mAh", "20000mAh"],
        priceRange: [3500, 28000],
        variantNames: ["20W", "65W"],
      },
      {
        slug: "phones",
        label: "Phone accessories",
        brands: ["ShieldCase", "GripMax", "LensGuard", "RingStand"],
        types: ["Phone Case", "Screen Guard", "Ring Light", "Tripod"],
        notes: ["Shockproof", "Matte", "Magnetic", "Foldable"],
        shades: ["iPhone", "Samsung", "Universal", "Pro Max"],
        priceRange: [2500, 18000],
        variantNames: ["Standard", "Pro fit"],
      },
      {
        slug: "smart-home",
        label: "Smart home",
        brands: ["HomeLink", "BrightDot", "PlugSmart", "ViewCam"],
        types: ["Smart Bulb", "Smart Plug", "Doorbell Cam", "Wi-Fi Extender"],
        notes: ["App control", "Voice ready", "HD", "Dual band"],
        shades: ["Warm white", "RGB", "Outdoor", "Indoor"],
        priceRange: [6500, 45000],
        variantNames: ["Single", "Twin pack"],
      },
    ],
  },
  home: {
    prefix: "HN",
    collectionLabel: "Home Nest",
    pool: "home",
    categories: [
      {
        slug: "bedding",
        label: "Bedding",
        brands: ["SoftLinen", "Cloud Duvet", "Rest Haven", "Cotton Loft"],
        types: ["Duvet Set", "Sheet Set", "Pillowcase Pack", "Throw Blanket"],
        notes: ["Breathable", "Hotel feel", "Hypoallergenic", "Machine wash"],
        shades: ["Ivory", "Sage", "Charcoal", "Blush"],
        priceRange: [12000, 48000],
        variantNames: ["Queen", "King"],
      },
      {
        slug: "kitchen",
        label: "Kitchen",
        brands: ["ChefStone", "Daily Prep", "ServeWell", "Pantry Co"],
        types: ["Dinner Set", "Knife Set", "Storage Jar", "Mixing Bowl"],
        notes: ["Dishwasher safe", "Non-stick", "Airtight", "Stackable"],
        shades: ["White", "Matte black", "Cream", "Terracotta"],
        priceRange: [8500, 42000],
        variantNames: ["Set of 4", "Set of 6"],
      },
      {
        slug: "decor",
        label: "Decor",
        brands: ["Nest & Co", "Frame Studio", "Ceramic Haus", "Wall Muse"],
        types: ["Wall Art", "Vase Set", "Mirror", "Table Lamp"],
        notes: ["Handmade", "Minimal", "Statement", "Gift box"],
        shades: ["Neutral", "Earth tones", "Brass", "Matte"],
        priceRange: [7500, 35000],
        variantNames: ["Small", "Large"],
      },
      {
        slug: "cleaning",
        label: "Cleaning",
        brands: ["PureHome", "Spark Kit", "FreshNest", "EcoMop"],
        types: ["Laundry Set", "Surface Spray", "Mop Kit", "Bin Set"],
        notes: ["Plant-based", "Concentrate", "Refill", "Compact"],
        shades: ["Lavender", "Citrus", "Unscented", "Ocean"],
        priceRange: [2800, 14000],
        variantNames: ["Starter", "Refill"],
      },
    ],
  },
  fitness: {
    prefix: "FV",
    collectionLabel: "Fit Vault",
    pool: "fitness",
    categories: [
      {
        slug: "activewear",
        label: "Activewear",
        brands: ["Flex Line", "Stride Studio", "Core Fit", "Move Daily"],
        types: ["Leggings", "Sports Bra", "Tank Top", "Shorts"],
        notes: ["Sweat-wick", "High waist", "Seamless", "Compression"],
        shades: ["Black", "Olive", "Berry", "Navy"],
        priceRange: [6500, 22000],
        variantNames: ["S", "M", "L"],
      },
      {
        slug: "equipment",
        label: "Equipment",
        brands: ["Iron Core", "Band Lab", "Yoga Flow", "Jump Pro"],
        types: ["Resistance Bands", "Yoga Mat", "Dumbbell Set", "Jump Rope"],
        notes: ["Home gym", "Non-slip", "Adjustable", "Portable"],
        shades: ["Light", "Medium", "Heavy", "Pro"],
        priceRange: [4500, 38000],
        variantNames: ["Starter", "Pro"],
      },
      {
        slug: "supplements",
        label: "Wellness",
        brands: ["Vital Stack", "Green Daily", "Recover+", "Hydrate Co"],
        types: ["Protein Powder", "Multivitamin", "Electrolyte Mix", "Collagen"],
        notes: ["Unflavored", "Chocolate", "Berry", "Sugar-free"],
        shades: ["30 servings", "60 servings", "Tub", "Sachets"],
        priceRange: [8500, 32000],
        variantNames: ["500g", "1kg"],
      },
      {
        slug: "recovery",
        label: "Recovery",
        brands: ["Rest Day", "Foam Co", "Ice Roll", "Stretch Kit"],
        types: ["Foam Roller", "Massage Ball", "Ice Pack Sleeve", "Stretch Band"],
        notes: ["Deep tissue", "Travel", "Reusable", "Post-workout"],
        shades: ["Blue", "Black", "Pink", "Grey"],
        priceRange: [3500, 16000],
        variantNames: ["Standard", "Firm"],
      },
    ],
  },
  kids: {
    prefix: "KC",
    collectionLabel: "Kids Corner",
    pool: "kids",
    categories: [
      {
        slug: "baby",
        label: "Baby",
        brands: ["Tiny Nest", "SoftCotton", "GentleCare", "FirstMonths"],
        types: ["Onesie Pack", "Bib Set", "Blanket", "Feeding Bottle"],
        notes: ["Organic cotton", "Hypoallergenic", "Gift set", "Newborn"],
        shades: ["0-3m", "3-6m", "6-12m", "Unisex"],
        priceRange: [4500, 18000],
        variantNames: ["Pack of 3", "Pack of 5"],
      },
      {
        slug: "toys",
        label: "Toys",
        brands: ["PlayCraft", "Bright Blocks", "Story Time", "Puzzle Co"],
        types: ["Building Blocks", "Puzzle", "Plush Toy", "Art Kit"],
        notes: ["Educational", "Non-toxic", "Ages 3+", "Travel size"],
        shades: ["Rainbow", "Pastel", "Animals", "Numbers"],
        priceRange: [3500, 22000],
        variantNames: ["Basic", "Deluxe"],
      },
      {
        slug: "school",
        label: "School",
        brands: ["Class Ready", "WriteWell", "Pack Smart", "Study Kit"],
        types: ["Backpack", "Lunch Box", "Stationery Set", "Water Bottle"],
        notes: ["Ergonomic", "Leak-proof", "Name tag", "Durable"],
        shades: ["Blue", "Pink", "Green", "Navy"],
        priceRange: [4500, 24000],
        variantNames: ["Primary", "Secondary"],
      },
      {
        slug: "kids-wear",
        label: "Kids wear",
        brands: ["Mini Chic", "Play Day", "Sunday Best", "Comfy Kids"],
        types: ["T-Shirt Pack", "Denim Shorts", "Party Dress", "Pajama Set"],
        notes: ["Soft fabric", "Easy wash", "School", "Weekend"],
        shades: ["Age 4-6", "Age 7-9", "Age 10-12", "Mixed"],
        priceRange: [5500, 16000],
        variantNames: ["Size 4", "Size 8", "Size 12"],
      },
    ],
  },
};

export function generateDemoCatalog(vertical) {
  if (vertical === "beauty") {
    return generateBeautyCatalog(6);
  }

  const config = VERTICALS[vertical];
  if (!config) {
    throw new Error(`Unknown demo vertical: ${vertical}`);
  }

  return buildCatalog(config);
}