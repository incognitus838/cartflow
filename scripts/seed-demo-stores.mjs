/**
 * Seed or refresh all seven rotating demo stores.
 * Run: npm run db:seed-demos
 */
import { PrismaClient } from "@prisma/client";
import { seedDemoStore } from "../lib/catalog/seed-demo-store.mjs";
import { DEMO_STORES, getDailyDemoStore } from "../lib/demo/stores.mjs";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: "demo@cartflow.app" } });
  if (!owner) {
    console.error("Run npm run db:seed first to create demo@cartflow.app");
    process.exit(1);
  }

  console.log(`Seeding ${DEMO_STORES.length} demo stores...\n`);

  for (const store of DEMO_STORES) {
    const { productCount } = await seedDemoStore(prisma, store, owner.id);
    console.log(`  ✓ ${store.name} (/${store.slug}) — ${productCount} products`);
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const today = getDailyDemoStore();
  console.log(`\nToday's featured demo: ${base}/demo → ${today.name} (/${today.slug})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());