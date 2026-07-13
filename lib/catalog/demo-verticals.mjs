import { generateBeautyCatalog } from "./beauty-categories.mjs";

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&q=80`;

const PRODUCTS_PER_CATEGORY = 4;

function buildCatalog({ prefix, collectionLabel, categories }) {
  const products = [];
  let skuCounter = 1000;

  for (const cat of categories) {
    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      const brand = cat.brands[i % cat.brands.length];
      const type = cat.types[i % cat.types.length];
      const note = cat.notes[i % cat.notes.length];
      const shade = cat.shades[i % cat.shades.length];
      const image = cat.images[i % cat.images.length];
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
  }

  return products;
}

const VERTICALS = {
  fashion: {
    prefix: "CT",
    collectionLabel: "Chic Threads",
    categories: [
      {
        slug: "apparel",
        label: "Apparel",
        images: [img("1515372032643-0a0e06c0ec20"), img("1490481651871-ab68de25d43d"), img("1483986768655-afb9a44e19b1")],
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
        images: [img("1548038718-wag9kux5zpg"), img("1553062407-98eeb64c6a62"), img("1590874109888-dcbe3c0d2795")],
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
        images: [img("1549298916-b41d501d3772"), img("1460353581641-37baddab0fa0"), img("1560769629-985e0e8e3ed0")],
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
        images: [img("1535632066927-ab7c9ab60908"), img("1611596991651-1059677f7c35"), img("1606760227097-9c9a6a6c638f")],
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
    categories: [
      {
        slug: "small-chops",
        label: "Small Chops",
        images: [img("1546069901-ba9599a1e090"), img("1606312619070-df48c6274a0e"), img("1504674900247-0877df9cc836")],
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
        images: [img("1555507036-ab1f4038808a"), img("1488477181946-6428a0291777"), img("1509440153526-dde4f9e0a7d7")],
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
        images: [img("1546173152-83d3a8c1c1f0"), img("1544145941-f90425340c7e"), img("1556679343-c7306c1976bc")],
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
        images: [img("1547592188-723c1b8d5d1d"), img("1512621776951-a57141f2eefd"), img("1495526374967-a802f85f08ee")],
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
    categories: [
      {
        slug: "audio",
        label: "Audio",
        images: [img("1590658268037-6bf12165a8df"), img("1484704849700-f032a568e944"), img("1505740420928-5e560c06d30b")],
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
        images: [img("1583394838333-ac0232172ad1"), img("1625948515291-a9c8a746b526"), img("1609091839313-baf4c0fb108c")],
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
        images: [img("1601784551447-20c9a7ecc3ed"), img("1511707171634-5f897ff02aa9"), img("1523206482620-dbc8284a3d38")],
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
        images: [img("1558003963-8d54f3d6c0f2"), img("1518455069457-3fc964c94ef5"), img("1587825140708-287f6f9e2869")],
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
    categories: [
      {
        slug: "bedding",
        label: "Bedding",
        images: [img("1584100936592-7f0bc2997b7d"), img("1631049307264-da0ec8d703b0"), img("1522771739532-24471fc5a88c")],
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
        images: [img("1556910103-1c02745aae4d"), img("1556909114-f6e7ad7d6346"), img("1584999738041-7c308e47d1b9")],
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
        images: [img("1618221195710-dd6b41faaea6"), img("1616486338442-a8831d38f3a2"), img("1603002583569-65a3a0a1f4b6")],
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
        images: [img("1585421514282-692b350137ca"), img("1563457956602-c7a3e426f1bf"), img("1527515637922-bc4e75b09b86")],
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
    categories: [
      {
        slug: "activewear",
        label: "Activewear",
        images: [img("1518310385805-722c040209d9"), img("1571019614242-c5c5dee9f50b"), img("1517836357463-d25dfeac3438")],
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
        images: [img("1517836357463-d25dfeac3438"), img("1576678927484-cc907957088c"), img("1598289431512-db9713e54301")],
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
        images: [img("1556228578-0d85b1a4d571"), img("1556228720-195a672e8a03"), img("1571019613455-0c759f0d5de1")],
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
        images: [img("1602143407151-7111542de6e8"), img("1544367567-0f2fcb009e0b"), img("1518611012118-696072aa579a")],
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
    categories: [
      {
        slug: "baby",
        label: "Baby",
        images: [img("1515488042361-ee00e017ddd1"), img("1503454536595-1d532e913f29"), img("1519689680085-3242357e6f2a")],
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
        images: [img("1558068718650-df9337c36b32"), img("1566576911221-84f49b789e91"), img("1515488042361-ee00e017ddd1")],
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
        images: [img("1553062407-98eeb64c6a62"), img("1583485083143-59f8b965966c"), img("1503676260728-1c00da094a0b")],
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
        images: [img("1503454536595-1d532e913f29"), img("1519238263530-30ca8a4d4c8f"), img("1503944583223-8e8e5f0e8d3b")],
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