/**
 * Seed or refresh the Glow Beauty demo store.
 * Run: npm run db:seed-demos
 */
import { config as loadEnv } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(root, ".env.local") });
loadEnv({ path: join(root, ".env") });
import { seedDemoStore } from "../lib/catalog/seed-demo-store.mjs";
import { DEMO_STORES, getDemoStore } from "../lib/demo/stores.mjs";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: "demo@cartflow.app" } });
  if (!owner) {
    console.error("Run npm run db:seed first to create demo@cartflow.app");
    process.exit(1);
  }

  console.log(`Seeding ${DEMO_STORES.length} demo store...\n`);

  for (const store of DEMO_STORES) {
    const { productCount } = await seedDemoStore(prisma, store, owner.id);
    console.log(`  ✓ ${store.name} (/${store.slug}) — ${productCount} products`);
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const demo = getDemoStore();
  console.log(`\nDemo store: ${base}/demo → ${demo.name} (/${demo.slug})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
