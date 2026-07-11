/**
 * Wipe the database and seed only Glow Beauty (+ demo seller & admin accounts).
 * Run: npm run db:reset-glow-beauty
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateBeautyCatalog } from "../lib/catalog/beauty-categories.mjs";
import { DEMO_BANK } from "../lib/catalog/demo-bank.mjs";
import { SKINCARE_IMAGES } from "../lib/catalog/skincare-images.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prisma = new PrismaClient();
const STORE_SLUG = "glow-beauty";
const DEMO_PASSWORD = "demo12345";
const BATCH_SIZE = 25;

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
}

async function ensureUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [
    { email: "demo@cartflow.app", name: "Ada Okonkwo", role: "OWNER" },
    { email: "admin@cartflow.app", name: "CartFlow Admin", role: "ADMIN" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
    console.log(`  User: ${user.email} (${user.role})`);
  }
}

async function seedGlowBeauty(ownerId) {
  const business = await prisma.business.create({
    data: {
      name: "Glow Beauty",
      slug: STORE_SLUG,
      description:
        "Premium makeup & personal care — lip care, oral care, body wash, skincare, fragrance & more. 60 curated items, add to cart instantly.",
      currency: "NGN",
      deliveryFee: 2000,
      phone: "+2348012345678",
      whatsapp: "+2348012345678",
      logoUrl: SKINCARE_IMAGES.serum,
      ownerId,
      plan: "PRO",
      approvalStatus: "APPROVED",
      isActive: true,
      ...DEMO_BANK,
      members: {
        create: { userId: ownerId, role: "OWNER" },
      },
    },
  });

  const catalog = generateBeautyCatalog();
  console.log(`  Creating ${catalog.length} products...`);

  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    const batch = catalog.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((item) => {
        const { images, variants, ...productData } = item;
        return prisma.product.create({
          data: {
            ...productData,
            businessId: business.id,
            images: { create: images },
            variants: variants.length ? { create: variants } : undefined,
          },
        });
      }),
    );
  }

  const baseFee = Number(business.deliveryFee);
  await prisma.deliveryZone.createMany({
    data: [
      { businessId: business.id, name: "Lekki", fee: Math.max(baseFee, 2000), sortOrder: 0 },
      { businessId: business.id, name: "Victoria Island", fee: Math.max(baseFee, 2500), sortOrder: 1 },
      { businessId: business.id, name: "Mainland", fee: Math.max(baseFee, 1500), sortOrder: 2 },
      { businessId: business.id, name: "Pickup at store", fee: 0, sortOrder: 3 },
    ],
  });

  return business;
}

async function verify() {
  const counts = {
    users: await prisma.user.count(),
    businesses: await prisma.business.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
  };

  const store = await prisma.business.findUnique({
    where: { slug: STORE_SLUG },
    include: { _count: { select: { products: true, deliveryZones: true } } },
  });

  if (!store) throw new Error("Glow Beauty store missing after reset.");
  if (counts.businesses !== 1) {
    throw new Error(`Expected 1 business, found ${counts.businesses}`);
  }

  console.log("\nDatabase state:");
  console.log(`  Users:      ${counts.users}`);
  console.log(`  Businesses: ${counts.businesses} (${store.name} / ${store.slug})`);
  console.log(`  Products:   ${counts.products}`);
  console.log(`  Zones:      ${store._count.deliveryZones}`);
  console.log(`  Orders:     ${counts.orders}`);
}

async function main() {
  console.log("Resetting database — Glow Beauty only...\n");

  console.log("1/4 Force-reset schema...");
  run("npx", ["prisma", "db", "push", "--force-reset", "--accept-data-loss"]);

  console.log("\n2/4 Demo accounts...");
  await ensureUsers();

  const owner = await prisma.user.findUnique({ where: { email: "demo@cartflow.app" } });
  if (!owner) throw new Error("Demo owner missing");

  console.log("\n3/4 Glow Beauty store + catalog...");
  await seedGlowBeauty(owner.id);

  console.log("\n4/4 Verify...");
  await verify();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  console.log(`\nDone.`);
  console.log(`  Storefront: ${base}/${STORE_SLUG}`);
  console.log(`  Seller:     demo@cartflow.app / ${DEMO_PASSWORD}`);
  console.log(`  Admin:      admin@cartflow.app / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());