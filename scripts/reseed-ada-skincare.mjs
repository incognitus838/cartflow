/**
 * One-off: rebrand ada-styles to Ada Skincare and replace fashion catalog.
 * Run: npm run db:reseed-skincare
 */
import { PrismaClient } from "@prisma/client";
import { SKINCARE_IMAGES } from "../lib/catalog/skincare-images.mjs";

const prisma = new PrismaClient();

const CATALOG = [
  {
    title: "Glow Ritual Vitamin C Serum",
    category: "Skincare",
    description:
      "15% vitamin C + ferulic acid brightening serum for hyperpigmentation and dull skin. Lightweight for Lagos humidity.",
    price: 12500,
    compareAtPrice: 15000,
    stock: 0,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.serum, alt: "Vitamin C Serum", sortOrder: 0 }],
    variants: [
      { name: "30ml", sku: "VCS-30", stock: 18 },
      { name: "50ml", sku: "VCS-50", stock: 12 },
    ],
  },
  {
    title: "Lagos Dew Hyaluronic Moisturizer",
    category: "Skincare",
    description:
      "Oil-free gel-cream with hyaluronic acid and ceramides. Locks in moisture without clogging pores.",
    price: 9800,
    compareAtPrice: 11500,
    stock: 0,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.moisturizer, alt: "Hyaluronic Moisturizer", sortOrder: 0 }],
    variants: [
      { name: "Normal Skin", sku: "LDM-N", stock: 14 },
      { name: "Oily Skin", sku: "LDM-O", stock: 16 },
    ],
  },
  {
    title: "Harmattan Shield SPF 50",
    category: "Skincare",
    description:
      "Broad-spectrum PA++++ sunscreen. No white cast on melanin-rich skin. Essential daily protection.",
    price: 11500,
    stock: 0,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.sunscreen, alt: "SPF 50 Sunscreen", sortOrder: 0 }],
    variants: [
      { name: "50ml", sku: "SPF-50", stock: 22 },
      { name: "100ml", sku: "SPF-100", stock: 10 },
    ],
  },
  {
    title: "Calm & Clear Niacinamide Toner",
    category: "Skincare",
    description:
      "5% niacinamide toner to refine pores, calm redness, and prep skin. Alcohol-free, fragrance-light.",
    price: 7200,
    stock: 25,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.toner, alt: "Niacinamide Toner", sortOrder: 0 }],
    variants: [],
  },
  {
    title: "Karité Shea Renewal Body Cream",
    category: "Bath & Body",
    description:
      "Rich unrefined shea butter body cream with cocoa butter. Soothes dry harmattan-season skin.",
    price: 6500,
    compareAtPrice: 8000,
    stock: 0,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.bodyCream, alt: "Shea Body Cream", sortOrder: 0 }],
    variants: [
      { name: "200g", sku: "KSB-200", stock: 20 },
      { name: "400g", sku: "KSB-400", stock: 11 },
    ],
  },
  {
    title: "Black Soap Gentle Cleanser",
    category: "Skincare",
    description:
      "Authentic African black soap formula with aloe. Deep-cleans without stripping — ideal for acne-prone skin.",
    price: 4500,
    stock: 0,
    status: "ACTIVE",
    images: [{ url: SKINCARE_IMAGES.cleanser, alt: "Black Soap Cleanser", sortOrder: 0 }],
    variants: [
      { name: "150ml", sku: "BSC-150", stock: 30 },
      { name: "300ml", sku: "BSC-300", stock: 18 },
    ],
  },
];

async function main() {
  const business = await prisma.business.findUnique({ where: { slug: "ada-styles" } });
  if (!business) {
    console.error("Store ada-styles not found. Run npm run db:seed first.");
    process.exit(1);
  }

  console.log("Rebranding to Ada Skincare and replacing catalog...\n");

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: "Ada Skincare",
      description:
        "Clean, melanin-friendly skincare made for Nigerian climate. Serums, SPF, and body care — order on WhatsApp.",
      logoUrl: SKINCARE_IMAGES.serum,
      plan: "STARTER",
    },
  });

  const deleted = await prisma.product.deleteMany({ where: { businessId: business.id } });
  console.log(`Removed ${deleted.count} old products.`);

  for (const item of CATALOG) {
    const { images, variants, ...productData } = item;
    await prisma.product.create({
      data: {
        ...productData,
        businessId: business.id,
        images: { create: images },
        variants: variants.length ? { create: variants } : undefined,
      },
    });
    console.log(`  + ${item.title}`);
  }

  await revalidateStorefront("ada-styles", business.id);

  console.log(`\nDone. Storefront: http://localhost:3001/ada-styles`);
}

async function revalidateStorefront(slug, businessId) {
  const secret = process.env.REVALIDATE_SECRET;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  if (!secret) {
    console.log("\nTip: set REVALIDATE_SECRET in .env.local to auto-clear production cache after reseed.");
    return;
  }

  const tags = [`store-${slug}`, `catalog-${businessId}`];
  for (const tag of tags) {
    try {
      const res = await fetch(`${base}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
        method: "POST",
        headers: { "x-revalidate-secret": secret },
      });
      if (res.ok) {
        console.log(`  Cache cleared: ${tag}`);
      } else {
        console.warn(`  Cache clear failed for ${tag} (${res.status})`);
      }
    } catch {
      console.warn(`  Cache clear skipped for ${tag} (dev server not running?)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());