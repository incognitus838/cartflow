import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_BANK } from "../lib/catalog/demo-bank.mjs";
import { SKINCARE_IMAGES } from "../lib/catalog/skincare-images.mjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo12345";

const SKINCARE_CATALOG = [
  {
    title: "Glow Ritual Vitamin C Serum",
    category: "Skincare",
    description:
      "15% vitamin C + ferulic acid brightening serum for hyperpigmentation and dull skin. Lightweight for Lagos humidity.",
    price: 12500,
    compareAtPrice: 15000,
    stock: 0,
    status: "ACTIVE",
    lowStockThreshold: 5,
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
    lowStockThreshold: 5,
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
    lowStockThreshold: 8,
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
    lowStockThreshold: 6,
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
    lowStockThreshold: 5,
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
    lowStockThreshold: 10,
    images: [{ url: SKINCARE_IMAGES.cleanser, alt: "Black Soap Cleanser", sortOrder: 0 }],
    variants: [
      { name: "150ml", sku: "BSC-150", stock: 30 },
      { name: "300ml", sku: "BSC-300", stock: 18 },
    ],
  },
];

async function replaceAdaSkincareCatalog(businessId) {
  await prisma.product.deleteMany({ where: { businessId } });

  const created = [];
  for (const item of SKINCARE_CATALOG) {
    const { images, variants, ...productData } = item;
    const product = await prisma.product.create({
      data: {
        ...productData,
        businessId,
        images: { create: images },
        variants: variants.length ? { create: variants } : undefined,
      },
    });
    created.push(product);
  }
  return created;
}

async function main() {
  console.log("Seeding CartFlow demo data...\n");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const owner = await prisma.user.upsert({
    where: { email: "demo@cartflow.app" },
    update: { name: "Ada Okonkwo", passwordHash },
    create: {
      email: "demo@cartflow.app",
      name: "Ada Okonkwo",
      role: "OWNER",
      passwordHash,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@cartflow.app" },
    update: { name: "CartFlow Admin", passwordHash, role: "ADMIN" },
    create: {
      email: "admin@cartflow.app",
      name: "CartFlow Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const business = await prisma.business.upsert({
    where: { slug: "ada-styles" },
    update: {
      name: "Ada Skincare",
      description:
        "Clean, melanin-friendly skincare made for Nigerian climate. Serums, SPF, and body care — order on WhatsApp.",
      logoUrl: SKINCARE_IMAGES.serum,
      plan: "STARTER",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK,
    },
    create: {
      name: "Ada Skincare",
      slug: "ada-styles",
      description:
        "Clean, melanin-friendly skincare made for Nigerian climate. Serums, SPF, and body care — order on WhatsApp.",
      currency: "NGN",
      deliveryFee: 1500,
      phone: "+2348012345678",
      whatsapp: "+2348012345678",
      logoUrl: SKINCARE_IMAGES.serum,
      ownerId: owner.id,
      plan: "STARTER",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK,
    },
  });

  await prisma.businessMember.upsert({
    where: {
      businessId_userId: { businessId: business.id, userId: owner.id },
    },
    update: {},
    create: {
      businessId: business.id,
      userId: owner.id,
      role: "OWNER",
    },
  });

  const products = await replaceAdaSkincareCatalog(business.id);

  const serum = products.find((p) => p.title === "Glow Ritual Vitamin C Serum");
  const sunscreen = products.find((p) => p.title === "Harmattan Shield SPF 50");

  const customer = await prisma.customer.upsert({
    where: {
      businessId_phone: { businessId: business.id, phone: "+2348098765432" },
    },
    update: { name: "Chioma Nwosu" },
    create: {
      businessId: business.id,
      name: "Chioma Nwosu",
      phone: "+2348098765432",
      email: "chioma@example.com",
      address: "12 Admiralty Way, Lekki, Lagos",
    },
  });

  const orderNumber = "CF-20260705-0001";
  let order = await prisma.order.findFirst({
    where: { businessId: business.id, orderNumber },
  });

  if (!order && serum && sunscreen) {
    const serumVariant = await prisma.productVariant.findFirst({
      where: { productId: serum.id, name: "30ml" },
    });

    const subtotal = 12500 + 11500;
    const deliveryFee = 1500;
    const total = subtotal + deliveryFee;

    order = await prisma.order.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        orderNumber,
        status: "PAID",
        subtotal,
        deliveryFee,
        total,
        paymentProvider: "MANUAL",
        paymentRef: null,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        notes: "Please deliver after 5pm",
        items: {
          create: [
            {
              productId: serum.id,
              variantId: serumVariant?.id,
              title: serum.title,
              variantName: serumVariant?.name,
              sku: serumVariant?.sku,
              quantity: 1,
              unitPrice: 12500,
              total: 12500,
            },
            {
              productId: sunscreen.id,
              title: sunscreen.title,
              variantName: "50ml",
              sku: "SPF-50",
              quantity: 1,
              unitPrice: 11500,
              total: 11500,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  Owner:    ${owner.email} (password: ${DEMO_PASSWORD})`);
  console.log(`  Admin:    ${admin.email} (password: ${DEMO_PASSWORD})`);
  console.log(`  Store:    Ada Skincare → /${business.slug}`);
  console.log(`  Products: ${products.length} skincare items`);
  console.log(`  Customer: ${customer.name}`);
  console.log(`  Order:    ${orderNumber}${order ? " (created)" : " (exists)"}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());