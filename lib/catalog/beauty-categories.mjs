/** Beauty & personal-care catalog templates — Unsplash product-style photos per category */

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&q=80`;

export const BEAUTY_CATEGORIES = [
  {
    slug: "lip-care",
    label: "Lip Care",
    images: [
      img("1596462502278-27bfdc403348"),
      img("1522335789203-aabd1fc54bc9"),
      img("1631214524020-7e3819a45aa1"),
      img("1512496015851-a90fb38ba796"),
      img("1586495777744-44168f14fbfb"),
      img("1608245448854-f4a463fb36d5"),
      img("1615485501229-b8b86e0d46ed"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
      img("1556228720-195a672e8a03"),
      img("1571875257727-256c39da42af"),
      img("1608571423902-eed4a5ad8108"),
    ],
    brands: ["Velvet Kiss", "Glossique", "Rosebud", "Lumière", "Petal Soft"],
    types: ["Lipstick", "Lip Gloss", "Lip Balm", "Lip Scrub", "Lip Liner", "Lip Oil", "Lip Mask"],
    notes: ["Matte", "Satin", "Hydrating", "Long-wear", "SPF 15", "Tinted", "Plumping"],
    shades: ["Rose", "Berry", "Nude", "Coral", "Plum", "Mauve", "Cherry", "Blush"],
    priceRange: [1800, 9500],
    variantNames: ["Standard", "Mini", "Duo Pack"],
  },
  {
    slug: "oral-care",
    label: "Oral Care",
    images: [
      img("1607613009820-a38f7209a0e9"),
      img("1629909613654-3596a314c9f6"),
      img("1559591937-7e5a4c7c2f6a"),
      img("1607613009820-a38f7209a0e9"),
      img("1585421514282-692b350137ca"),
      img("1556228578-0d85b1a4d571"),
      img("1571781926291-c477ebfd024b"),
      img("1612817288484-6f916006741a"),
      img("1522335789203-aabd1fc54bc9"),
      img("1556228720-195a672e8a03"),
    ],
    brands: ["BrightSmile", "DentaPure", "FreshMint", "PearlWhite", "Oraluxe"],
    types: ["Toothpaste", "Mouthwash", "Dental Floss", "Whitening Strips", "Toothbrush", "Tongue Scraper"],
    notes: ["Fluoride", "Charcoal", "Sensitive", "Whitening", "Alcohol-free", "Kids", "Herbal"],
    shades: ["Cool Mint", "Fresh", "Peppermint", "Cinnamon", "Unflavored"],
    priceRange: [1200, 6500],
    variantNames: ["75ml", "150ml", "Family Pack"],
  },
  {
    slug: "body-wash",
    label: "Body Wash",
    images: [
      img("1556228578-0d85b1a4d571"),
      img("1571875257727-256c39da42af"),
      img("1571781926291-c477ebfd024b"),
      img("1612817288484-6f916006741a"),
      img("1522335789203-aabd1fc54bc9"),
      img("1556228720-195a672e8a03"),
      img("1608571423902-eed4a5ad8108"),
      img("1596462502278-27bfdc403348"),
      img("1608245448854-f4a463fb36d5"),
      img("1515377905703-c4788e51af15"),
    ],
    brands: ["SilkSkin", "Harmattan Relief", "Coconut Dew", "Aloe Fresh", "Shea Cloud"],
    types: ["Body Wash", "Shower Gel", "Body Scrub", "Exfoliating Wash", "Antibacterial Wash"],
    notes: ["Moisturizing", "Sulfate-free", "pH-balanced", "Exfoliating", "Dermatologist-tested"],
    shades: ["Coconut", "Lavender", "Citrus", "Unscented", "Rose", "Tea Tree"],
    priceRange: [2200, 7800],
    variantNames: ["250ml", "500ml", "1L"],
  },
  {
    slug: "face-makeup",
    label: "Face Makeup",
    images: [
      img("1522335789203-aabd1fc54bc9"),
      img("1512496015851-a90fb38ba796"),
      img("1596462502278-27bfdc403348"),
      img("1631214524020-7e3819a45aa1"),
      img("1586495777744-44168f14fbfb"),
      img("1615485501229-b8b86e0d46ed"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
      img("1515377905703-c4788e51af15"),
      img("1487412947147-5cebf1009282"),
    ],
    brands: ["Flawless Fit", "GlowBase", "Velvet Veil", "Nude Theory", "Canvas Pro"],
    types: ["Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Highlighter", "Primer", "Setting Spray"],
    notes: ["Full coverage", "Buildable", "Oil-free", "SPF 30", "Transfer-proof", "Vegan"],
    shades: ["Fair", "Light", "Medium", "Tan", "Deep", "Rich", "Warm", "Cool"],
    priceRange: [3500, 18500],
    variantNames: ["30ml", "Full Size", "Travel Size"],
  },
  {
    slug: "eye-makeup",
    label: "Eye Makeup",
    images: [
      img("1512496015851-a90fb38ba796"),
      img("1522335789203-aabd1fc54bc9"),
      img("1631214524020-7e3819a45aa1"),
      img("1487412947147-5cebf1009282"),
      img("1515377905703-c4788e51af15"),
      img("1596462502278-27bfdc403348"),
      img("1586495777744-44168f14fbfb"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
      img("1615485501229-b8b86e0d46ed"),
    ],
    brands: ["Lash Luxe", "EyeCanvas", "Midnight Muse", "BrowCraft", "Stellar Eyes"],
    types: ["Mascara", "Eyeliner", "Eyeshadow Palette", "Brow Pencil", "Brow Gel", "False Lashes", "Eye Primer"],
    notes: ["Waterproof", "Smudge-proof", "Volumizing", "Lengthening", "Curling", "12hr wear"],
    shades: ["Black", "Brown", "Nude", "Gold", "Smoky", "Neutral", "Warm"],
    priceRange: [2800, 14500],
    variantNames: ["Single", "Duo", "Palette"],
  },
  {
    slug: "nail-care",
    label: "Nail Care",
    images: [
      img("1487412947147-5cebf1009282"),
      img("1604654894612-3e88c9637db0"),
      img("1519014818378-bf8bb6c69dfa"),
      img("1522335789203-aabd1fc54bc9"),
      img("1596462502278-27bfdc403348"),
      img("1631214524020-7e3819a45aa1"),
      img("1515377905703-c4788e51af15"),
      img("1586495777744-44168f14fbfb"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
    ],
    brands: ["Polish Pro", "NailNest", "Geluxe", "ManiMuse", "TipTop"],
    types: ["Nail Polish", "Gel Polish", "Base Coat", "Top Coat", "Cuticle Oil", "Nail Strengthener"],
    notes: ["Quick-dry", "Chip-resistant", "Breathable", "Vegan", "High-shine", "Strengthening"],
    shades: ["Red", "Pink", "Nude", "Burgundy", "Glitter", "French", "Pastel"],
    priceRange: [1500, 8500],
    variantNames: ["10ml", "15ml", "Set of 3"],
  },
  {
    slug: "skincare",
    label: "Skincare",
    images: [
      img("1556228578-0d85b1a4d571"),
      img("1556228720-195a672e8a03"),
      img("1571781926291-c477ebfd024b"),
      img("1571875257727-256c39da42af"),
      img("1608571423902-eed4a5ad8108"),
      img("1612817288484-6f916006741a"),
      img("1526045478514-869544fbf963"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
    ],
    brands: ["Ada Labs", "Dew Drop", "Harmattan Shield", "Glow Ritual", "Calm & Clear"],
    types: ["Serum", "Moisturizer", "Cleanser", "Toner", "Sunscreen", "Face Mask", "Eye Cream", "Exfoliant"],
    notes: ["Vitamin C", "Hyaluronic", "Niacinamide", "Retinol", "SPF 50", "Fragrance-free"],
    shades: ["Normal", "Oily", "Dry", "Combination", "Sensitive"],
    priceRange: [4500, 22000],
    variantNames: ["30ml", "50ml", "100ml"],
  },
  {
    slug: "hair-care",
    label: "Hair Care",
    images: [
      img("1522335789203-aabd1fc54bc9"),
      img("1556228578-0d85b1a4d571"),
      img("1571781926291-c477ebfd024b"),
      img("1571875257727-256c39da42af"),
      img("1612817288484-6f916006741a"),
      img("1608571423902-eed4a5ad8108"),
      img("1556228720-195a672e8a03"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
      img("1515377905703-c4788e51af15"),
    ],
    brands: ["Curl Crown", "Silk Strand", "Root Revive", "Shea Crown", "Braid Bliss"],
    types: ["Shampoo", "Conditioner", "Hair Oil", "Leave-in", "Hair Mask", "Edge Control", "Heat Protectant"],
    notes: ["Sulfate-free", "Moisturizing", "Anti-breakage", "Scalp care", "Color-safe", "4C friendly"],
    shades: ["All Types", "Curly", "Coily", "Straight", "Wavy", "Damaged"],
    priceRange: [2800, 12500],
    variantNames: ["250ml", "400ml", "Family Size"],
  },
  {
    slug: "fragrance",
    label: "Fragrance",
    images: [
      img("1541643600911-8f0bdad72adb"),
      img("1594035910387-4c1f4a0d0c0e"),
      img("1592945403240-b31c9f5f1f4c"),
      img("1587019639946-48e01d4b2a88"),
      img("1596462502278-27bfdc403348"),
      img("1522335789203-aabd1fc54bc9"),
      img("1631214524020-7e3819a45aa1"),
      img("1571781926291-c477ebfd024b"),
      img("1556228578-0d85b1a4d571"),
      img("1608571423902-eed4a5ad8108"),
    ],
    brands: ["Oud Lagos", "Jasmine Nights", "Savanna Mist", "Velvet Oud", "Coastal Bloom"],
    types: ["Eau de Parfum", "Body Mist", "Perfume Oil", "Rollerball", "Gift Set", "Deodorant Spray"],
    notes: ["Long-lasting", "Unisex", "Floral", "Woody", "Fresh", "Oriental"],
    shades: ["50ml", "100ml", "Travel", "Intense", "Light"],
    priceRange: [5500, 45000],
    variantNames: ["30ml", "50ml", "100ml"],
  },
  {
    slug: "bath-body",
    label: "Bath & Body",
    images: [
      img("1571875257727-256c39da42af"),
      img("1571781926291-c477ebfd024b"),
      img("1612817288484-6f916006741a"),
      img("1556228578-0d85b1a4d571"),
      img("1556228720-195a672e8a03"),
      img("1608571423902-eed4a5ad8108"),
      img("1522335789203-aabd1fc54bc9"),
      img("1615485501229-b8b86e0d46ed"),
      img("1608245448854-f4a463fb36d5"),
      img("1515377905703-c4788e51af15"),
    ],
    brands: ["Shea Ritual", "Cocoa Cloud", "Spa Day", "Warm Vanilla", "Tropical Mist"],
    types: ["Body Lotion", "Body Butter", "Hand Cream", "Foot Cream", "Bath Salts", "Bar Soap", "Body Oil"],
    notes: ["Shea butter", "Fast-absorbing", "Non-greasy", "24hr moisture", "Dermatologist-tested"],
    shades: ["Vanilla", "Coconut", "Lavender", "Unscented", "Citrus", "Rose"],
    priceRange: [2200, 9800],
    variantNames: ["200ml", "400ml", "Pump Bottle"],
  },
];

/** 10 categories × 6 products = 60 items (keeps Glow Beauty fast in dev/demo). */
export const PRODUCTS_PER_CATEGORY = 6;

export function generateBeautyCatalog(totalPerCategory = PRODUCTS_PER_CATEGORY) {
  const products = [];
  let skuCounter = 1000;

  for (const cat of BEAUTY_CATEGORIES) {
    for (let i = 0; i < totalPerCategory; i++) {
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
      const compareAt =
        i % 3 === 0 ? Math.round(basePrice * 1.18) : null;
      const hasVariants = i % 4 !== 3;
      const variantCount = hasVariants ? 2 + (i % 2) : 0;

      skuCounter += 1;
      const skuBase = `GB-${cat.slug.slice(0, 3).toUpperCase()}-${skuCounter}`;

      const variants = [];
      if (variantCount > 0) {
        for (let v = 0; v < variantCount; v++) {
          variants.push({
            name: cat.variantNames[v % cat.variantNames.length],
            sku: `${skuBase}-${v + 1}`,
            stock: 8 + ((i + v * 3) % 40),
            price: v === 1 ? Math.round(basePrice * 1.12) : null,
          });
        }
      }

      products.push({
        title,
        description: `${cat.label} essential. ${note} formula designed for everyday use. Part of the Glow Beauty collection.`,
        category: cat.label,
        price: basePrice,
        compareAtPrice: compareAt,
        stock: variantCount > 0 ? 0 : 12 + (i % 35),
        status: "ACTIVE",
        lowStockThreshold: 5,
        images: [{ url: image, alt: title, sortOrder: 0 }],
        variants,
      });
    }
  }

  return products;
}