/**
 * Wipe the database and seed the Glow Beauty demo store (+ demo seller & admin).
 * Run: npm run db:reset-glow-beauty
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDemoStore } from "../lib/catalog/seed-demo-store.mjs";
import { DEMO_STORES, getDemoStore } from "../lib/demo/stores.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo12345";

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

async function verify() {
  const counts = {
    users: await prisma.user.count(),
    businesses: await prisma.business.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
  };

  if (counts.businesses !== DEMO_STORES.length) {
    throw new Error(`Expected ${DEMO_STORES.length} businesses, found ${counts.businesses}`);
  }

  console.log("\nDatabase state:");
  console.log(`  Users:      ${counts.users}`);
  console.log(`  Businesses: ${counts.businesses}`);
  console.log(`  Products:   ${counts.products}`);
  console.log(`  Orders:     ${counts.orders}`);
  console.log("  Demo stores:");
  for (const store of DEMO_STORES) {
    const row = await prisma.business.findUnique({
      where: { slug: store.slug },
      include: { _count: { select: { products: true } } },
    });
    if (!row) throw new Error(`Missing demo store: ${store.slug}`);
    console.log(`    /${store.slug} — ${row._count.products} products (${store.type})`);
  }
}

async function main() {
  console.log("Resetting database — Glow Beauty demo store...\n");

  console.log("1/4 Force-reset schema...");
  run("npx", ["prisma", "db", "push", "--force-reset", "--accept-data-loss"]);

  console.log("\n2/4 Demo accounts...");
  await ensureUsers();

  const owner = await prisma.user.findUnique({ where: { email: "demo@cartflow.app" } });
  if (!owner) throw new Error("Demo owner missing");

  console.log("\n3/4 Demo stores + catalogs...");
  for (const store of DEMO_STORES) {
    const { productCount } = await seedDemoStore(prisma, store, owner.id);
    console.log(`  ✓ ${store.name} — ${productCount} products`);
  }

  console.log("\n4/4 Verify...");
  await verify();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const demo = getDemoStore();
  console.log(`\nDone.`);
  console.log(`  Demo store: ${base}/demo  →  ${demo.name} (/${demo.slug})`);
  console.log(`  Seller:     demo@cartflow.app / ${DEMO_PASSWORD}`);
  console.log(`  Admin:      admin@cartflow.app / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());